import json
import os
import random
import string

import requests
import stripe
from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import send_mail
from django.http import JsonResponse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from dotenv import load_dotenv
from google.auth.transport.requests import Request
from google.oauth2 import id_token
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    FAQ,
    AnalysisHistory,
    BlogPost,
    CarouselImage,
    CartItem,
    ConsultationRequest,
    Order,
    Product,
    RegisteredUser,
    ServiceRating,
)
from .serializers import (
    AnalysisHistorySerializer,
    BlogPostSerializer,
    CarouselImageSerializer,
    CartItemSerializer,
    ConsultationRequestSerializer,
    ContactMessageSerializer,
    FAQSerializer,
    OrderSerializer,
    ProductSerializer,
    RegisteredUserSerializer,
    ServiceRatingSerializer,
)

# Load environment variables
load_dotenv()

# Stripe configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
if not stripe.api_key:
    # Use a default test key for development if not set
    stripe.api_key = "sk_test_51H9yTFeR8u1Wh2Lk3Mn4oP6qRs7TuVwXy9ZaBcDeFgHi2JkLm"
    print(
        "Warning: Using default Stripe test key. Set STRIPE_SECRET_KEY environment variable for production."
    )

# ——— Health Check ——————————————————————————————————


@api_view(["GET"])
def health_check(request):
    """
    Health endpoint for frontend to check backend status
    """
    return Response(
        {
            "status": "healthy",
            "message": "Aurora Organics API is running",
            "timestamp": timezone.now().isoformat(),
            "version": "1.0.0",
        },
        status=status.HTTP_200_OK,
    )


# ——— Analysis History ——————————————————————————————————


class AnalysisHistoryCreate(APIView):
    def post(self, request, format=None):
        serializer = AnalysisHistorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LatestAnalysisHistoryView(generics.ListAPIView):
    serializer_class = AnalysisHistorySerializer

    def get_queryset(self):
        user_email = self.request.query_params.get("user_email")
        if user_email:
            return AnalysisHistory.objects.filter(user_email=user_email).order_by(
                "-created_at"
            )[:1]
        return AnalysisHistory.objects.none()


class AnalysisHistoryListView(generics.ListAPIView):
    serializer_class = AnalysisHistorySerializer

    def get_queryset(self):
        user_email = self.request.query_params.get("user_email")
        if user_email:
            return AnalysisHistory.objects.filter(user_email=user_email).order_by(
                "-created_at"
            )
        return AnalysisHistory.objects.none()


class AnalysisHistoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = AnalysisHistory.objects.all()
    serializer_class = AnalysisHistorySerializer


# ——— User Registration & Login ——————————————————————————
class UserRegistrationView(APIView):
    def post(self, request, format=None):
        serializer = RegisteredUserSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            if RegisteredUser.objects.filter(email=email).exists():
                return Response(
                    {"error": "User already registered."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = serializer.save()
            user.password = make_password(serializer.validated_data["password"])
            user.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    def post(self, request, format=None):
        email = request.data.get("email")
        password = request.data.get("password")
        try:
            user = RegisteredUser.objects.get(email=email)
            if check_password(password, user.password):
                return Response(
                    RegisteredUserSerializer(user).data, status=status.HTTP_200_OK
                )
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
            )
        except RegisteredUser.DoesNotExist:
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
            )


# ——— Products ————————————————————————————————————————
class ProductListView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


# ——— Cart & Orders ————————————————————————————————————
class AddToCartView(APIView):
    def post(self, request, format=None):
        serializer = CartItemSerializer(data=request.data)
        if serializer.is_valid():
            user_email = request.data.get("user_email")
            if not user_email:
                return Response(
                    {"error": "User email is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            product = serializer.validated_data.get("product")
            if not product:
                return Response(
                    {"error": "Product is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            quantity = serializer.validated_data.get("quantity", 1)

            existing = CartItem.objects.filter(
                user_email=user_email, product=product, ordered=False
            ).first()

            if existing:
                existing.quantity += quantity
                existing.save()
                return Response(
                    CartItemSerializer(existing).data, status=status.HTTP_200_OK
                )

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CartItemListView(generics.ListAPIView):
    serializer_class = CartItemSerializer

    def get_queryset(self):
        user_email = self.request.query_params.get("user_email")
        if user_email:
            return CartItem.objects.filter(user_email=user_email, ordered=False)
        return CartItem.objects.none()


class CartItemDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer

    def delete(self, request, *args, **kwargs):
        item = self.get_object()
        if item.ordered:
            return Response(
                {"error": "Cannot delete an item that has already been ordered."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().delete(request, *args, **kwargs)


# ——— Consultations & Contact —————————————————————————————
@method_decorator(csrf_exempt, name="dispatch")
class ConsultationRequestCreate(APIView):
    def post(self, request, format=None):
        serializer = ConsultationRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContactMessageCreateView(APIView):
    def post(self, request, format=None):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Message sent successfully!"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ——— Profile Management ————————————————————————————————
class ProfileUpdateView(APIView):
    def put(self, request, format=None):
        email = request.data.get("email")
        try:
            user = RegisteredUser.objects.get(email=email)
        except RegisteredUser.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = RegisteredUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def upload_profile_image(request):
    email = request.data.get("email")
    profile_image = request.data.get("profileImage")

    if not email or not profile_image:
        return Response(
            {"error": "Email and profile image are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = RegisteredUser.objects.get(email=email)
        user.profileImage = profile_image
        user.save()
        return Response({"message": "Profile image updated successfully."})
    except RegisteredUser.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
def get_profile_image(request):
    email = request.query_params.get("email")

    if not email:
        return Response(
            {"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = RegisteredUser.objects.get(email=email)
        return Response({"profile_image_url": user.profileImage})
    except RegisteredUser.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
def change_password(request):
    email = request.data.get("email")
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not all([email, old_password, new_password]):
        return Response(
            {"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = RegisteredUser.objects.get(email=email)
    except RegisteredUser.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    if not check_password(old_password, user.password):
        return Response(
            {"error": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST
        )

    if old_password == new_password:
        return Response(
            {"error": "New password must be different."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(new_password) < 8:
        return Response(
            {"error": "Password must be ≥8 characters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.password = make_password(new_password)
    user.save()

    return Response(
        {"message": "Password changed successfully!"}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
def forgot_password(request):
    email = request.data.get("email")
    if not email:
        return Response(
            {"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = RegisteredUser.objects.get(email=email)
    except RegisteredUser.DoesNotExist:
        return Response(
            {"error": "No user with this email."}, status=status.HTTP_404_NOT_FOUND
        )

    characters = string.ascii_letters + string.digits + string.punctuation
    new_temp_password = "".join(random.choice(characters) for _ in range(12))

    user.password = make_password(new_temp_password)
    user.save()

    subject = "Aurora Organics - Password Reset"
    message = f"""Hello,
    
Your temporary password is:
{new_temp_password}

Please login and change your password immediately.

Thank you!"""

    send_mail(
        subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False
    )

    return Response(
        {"message": "Temporary password sent to your email."}, status=status.HTTP_200_OK
    )


# ——— Orders ——————————————————————————————————————————
class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        user_email = self.request.query_params.get("user_email")
        if user_email:
            return Order.objects.filter(user_email=user_email).order_by("-date")
        return Order.objects.none()


class OrderRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def delete(self, request, *args, **kwargs):
        order = self.get_object()
        if order.status != "pending":
            return Response(
                {"error": "Cannot delete an order that is already in progress."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().delete(request, *args, **kwargs)


# 🛒 Create Stripe Checkout Session
@api_view(["POST"])
def create_checkout_session(request):
    try:
        cart = request.data.get("cart", [])
        if not cart:
            return Response({"error": "Cart is empty"}, status=400)

        line_items = []
        for item in cart:
            line_items.append(
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": item["product_name"],
                        },
                        "unit_amount": int(float(item["price"]) * 100),
                    },
                    "quantity": item["quantity"],
                }
            )

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url="http://localhost:5173/checkout?success=true",
            cancel_url="http://localhost:5173/checkout?canceled=true",
        )

        return Response({"id": session.id})
    except Exception as e:
        print("STRIPE SESSION ERROR:", str(e))
        return Response({"error": str(e)}, status=500)


class PlaceOrderView(APIView):
    def post(self, request):
        print("🚀 PlaceOrderView called")
        print("Request Data:", request.data)

        user_email = request.data.get("user_email")
        if not user_email:
            print("❗ Missing user_email in request")
            return Response({"error": "User email is required."}, status=400)

        cart_items = CartItem.objects.filter(user_email=user_email, ordered=False)
        if not cart_items.exists():
            print("❗ No cart items found for:", user_email)
            return Response({"error": "No items in cart"}, status=400)

        total = sum(float(item.product.price) * item.quantity for item in cart_items)

        order = Order.objects.create(
            user_email=user_email,
            shipping_first_name=request.data.get("shipping_first_name"),
            shipping_last_name=request.data.get("shipping_last_name"),
            shipping_email=request.data.get("shipping_email"),
            shipping_address=request.data.get("shipping_address"),
            shipping_city=request.data.get("shipping_city"),
            shipping_state=request.data.get("shipping_state"),
            shipping_zip=request.data.get("shipping_zip"),
            shipping_country=request.data.get("shipping_country"),
            total=total,
            payment_status="paid",
            status="pending",
            date=timezone.now(),
        )

        print("✅ Order created:", order)

        order.items.set(cart_items)
        cart_items.update(ordered=True)

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=201)


# Public carousel (only active slides, ordered)
class CarouselImageListView(generics.ListAPIView):
    queryset = CarouselImage.objects.filter(is_active=True).order_by("order")
    serializer_class = CarouselImageSerializer


class FAQListPublicView(generics.ListAPIView):
    queryset = FAQ.objects.all().order_by("-created_at")
    serializer_class = FAQSerializer


@api_view(["GET"])
def analysis_summary(request, email):
    history = AnalysisHistory.objects.filter(user_email=email).order_by("-created_at")
    if not history.exists():
        return Response(
            {"last_analysis": None, "common_issue": None, "skin_score": None}
        )

    last = history.first()
    issue_counts = {}
    for h in history:
        issue_counts[h.predicted_condition] = (
            issue_counts.get(h.predicted_condition, 0) + 1
        )

    common_issue = max(issue_counts, key=issue_counts.get)
    return Response(
        {
            "last_analysis": last.created_at.strftime("%Y-%m-%d"),
            "common_issue": common_issue,
            "skin_score": round(last.confidence * 100)
            if last.confidence is not None
            else None,
        }
    )


@api_view(["GET"])
def recommended_products(request, email):
    history = AnalysisHistory.objects.filter(user_email=email).order_by("-created_at")
    if not history.exists():
        return Response([])

    latest = history.first()
    predicted_condition = latest.predicted_condition.lower()
    skin_type = latest.skin_type.lower() if latest.skin_type else ""
    skin_concern = predicted_condition

    def score(product):
        score = 0

        # Convert JSON list fields to lowercase strings for matching
        targets_text = (
            ", ".join(product.targets)
            if isinstance(product.targets, list)
            else str(product.targets or "")
        )
        suitable_text = (
            ", ".join(product.suitable_for)
            if isinstance(product.suitable_for, list)
            else str(product.suitable_for or "")
        )

        if predicted_condition in targets_text.lower():
            score += 3
        if skin_type in suitable_text.lower():
            score += 2
        if skin_concern in suitable_text.lower():
            score += 1

        return score

    all_products = Product.objects.all()
    sorted_products = sorted(all_products, key=score, reverse=True)
    top_products = sorted_products[:3]

    serializer = ProductSerializer(top_products, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def blogs(request):
    latest = BlogPost.objects.order_by("-created_at")[:5]
    serializer = BlogPostSerializer(latest, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def user_activity(request, email):
    activity = []

    analysis = AnalysisHistory.objects.filter(user_email=email).order_by("-created_at")[
        :1
    ]
    if analysis.exists():
        description = f"Skin analyzed for {analysis[0].predicted_condition} on {analysis[0].created_at.strftime('%b %d')}"
        activity.append({"description": description})

    consult = ConsultationRequest.objects.filter(email=email).order_by("-submitted_at")[
        :1
    ]

    if consult.exists():
        activity.append(
            {
                "description": f"Consultation booked with {getattr(consult[0], 'doctor_name', 'a specialist')}"
            }
        )

    order = Order.objects.filter(user_email=email).order_by("-date")[:1]
    if order.exists() and order[0].items.exists():
        item = order[0].items.first()
        activity.append({"description": f"Ordered: {item.product_name}"})

    return Response(activity)


@api_view(["POST"])
def submit_rating(request):
    email = request.data.get("user_email")
    name = request.data.get("user_name", "")
    stars = request.data.get("stars")
    comment = request.data.get("comment", "")
    profile_image_url = request.data.get("profile_image_url", "")

    rating = ServiceRating.objects.create(
        user_email=email,
        user_name=name,
        profile_image_url=profile_image_url,
        stars=stars,
        comment=comment,
    )
    return Response({"message": "Thank you for your feedback!"}, status=201)


@api_view(["GET"])
def approved_ratings(request):
    ratings = ServiceRating.objects.filter(approved=True).order_by("-submitted_at")
    serializer = ServiceRatingSerializer(ratings, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def get_prediction_mapping(request):
    try:
        # Call Flask API
        response = requests.get("http://localhost:5000/model-info")
        if response.status_code != 200:
            return Response({"error": "Flask model info unavailable"}, status=500)

        mapping = response.json()
        return Response(mapping, status=200)

    except requests.exceptions.RequestException as e:
        return Response({"error": str(e)}, status=500)


GOOGLE_CLIENT_ID = "372577436744-fs9686m4uvvikhlmv75971sffhg5ts2v.apps.googleusercontent.com"  # Replace with actual ID


@csrf_exempt
def google_login(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid method"}, status=405)

    try:
        data = json.loads(request.body)
        token = data.get("token")
        if not token:
            return JsonResponse({"error": "No token provided"}, status=400)

        idinfo = id_token.verify_oauth2_token(token, Request(), GOOGLE_CLIENT_ID)

        email = idinfo["email"]
        name = idinfo.get("name", "Google User")

        user, created = RegisteredUser.objects.get_or_create(
            email=email,
            defaults={
                "name": name,
                "password": "",
                "age": "",
                "allergies": [],
                "profileImage": "",
            },
        )

        return JsonResponse(
            {
                "email": user.email,
                "name": user.name,
                "age": user.age,
                "allergies": user.allergies,
            }
        )

    except ValueError as ve:
        print("Google token error:", ve)
        return JsonResponse({"error": "Invalid token"}, status=400)
    except Exception as e:
        print("Unexpected error:", e)  # 👈 this will print the exact problem
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["GET"])
def user_consultations(request, email):
    consultations = ConsultationRequest.objects.filter(email=email).order_by(
        "-submitted_at"
    )
    serializer = ConsultationRequestSerializer(consultations, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def create_consultation_checkout_session(request):
    consultation_id = request.data.get("consultation_id")
    email = request.data.get("email")

    try:
        consultation = ConsultationRequest.objects.get(id=consultation_id, email=email)
    except ConsultationRequest.DoesNotExist:
        return Response({"error": "Consultation not found"}, status=404)

    if not consultation.consultation_fee:
        return Response({"error": "Fee not set"}, status=400)

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="payment",
        customer_email=email,
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "unit_amount": int(float(consultation.consultation_fee) * 100),
                    "product_data": {
                        "name": f"Consultation with {consultation.assigned_consultant}",
                    },
                },
                "quantity": 1,
            }
        ],
        success_url=f"http://localhost:5173/payment-success?consultation_id={consultation.id}",
        cancel_url="http://localhost:5173/welcome",
    )
    return Response({"id": session.id})
