# adminpanel/views.py
from rest_framework.views import APIView
from rest_framework.generics import DestroyAPIView
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework import generics
from aurora.models import (RegisteredUser, ConsultationRequest, AnalysisHistory, Product,Order,ContactMessage,CarouselImage, FAQ, BlogPost, ServiceRating)
from aurora.serializers import (
    RegisteredUserSerializer, 
    ConsultationRequestSerializer, 
    AnalysisHistorySerializer,
    ProductSerializer, 
    OrderSerializer,
    ContactMessageSerializer,
    CarouselImageSerializer,
    FAQSerializer,
    BlogPostSerializer,
    ServiceRatingSerializer,
    )

from rest_framework.generics import RetrieveUpdateDestroyAPIView
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

class AdminLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(username=email, password=password)

        if user and user.is_staff:
            return Response({"message": "Admin authenticated successfully."}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid admin credentials."}, status=status.HTTP_400_BAD_REQUEST)

class RegisteredUsersListAPIView(generics.ListAPIView):
    queryset = RegisteredUser.objects.all()
    serializer_class = RegisteredUserSerializer

class ConsultationsListAPIView(generics.ListAPIView):
    queryset = ConsultationRequest.objects.all().order_by('-submitted_at')
    serializer_class = ConsultationRequestSerializer

class AnalyzeListAPIView(generics.ListAPIView):
    queryset = AnalysisHistory.objects.all().order_by('-created_at')
    serializer_class = AnalysisHistorySerializer

class RegisteredUserDeleteAPIView(generics.DestroyAPIView):
    queryset = RegisteredUser.objects.all()
    serializer_class = RegisteredUserSerializer
    lookup_field = 'email'

class ConsultationRequestDeleteAPIView(generics.DestroyAPIView):
    queryset = ConsultationRequest.objects.all()
    serializer_class = ConsultationRequestSerializer
    lookup_field = 'id'

class AnalysisHistoryListView(generics.ListAPIView):
    serializer_class = AnalysisHistorySerializer

    def get_queryset(self):
        # When no user_email filter is provided, return all records
        user_email = self.request.query_params.get('user_email')
        if user_email:
            return AnalysisHistory.objects.filter(user_email=user_email).order_by('-created_at')
        return AnalysisHistory.objects.all()  # For admin analytics

class AnalysisHistoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = AnalysisHistory.objects.all()
    serializer_class = AnalysisHistorySerializer

@method_decorator(csrf_exempt, name='dispatch')
class AdminProductListCreateView(generics.ListCreateAPIView):
    """
    GET: List all products.
    POST: Create a new product.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

@method_decorator(csrf_exempt, name='dispatch')
class AdminProductRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve a product by id.
    PUT/PATCH: Update a product.
    DELETE: Delete a product.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class AdminOrderListView(generics.ListAPIView):
    """
    GET: List all orders for admin use.
    """
    serializer_class = OrderSerializer
    queryset = Order.objects.all().order_by('-date')

class ConfirmOrderView(APIView):
    """
    PUT: Confirm an order by updating its status to "confirmed".
    Expects a URL parameter with the order's pk.
    """
    def put(self, request, pk, format=None):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        
        order.status = "confirmed"
        order.save()
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class AdminOrderDeleteView(DestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    lookup_field = 'pk'  # order ID

class ContactMessageListView(generics.ListAPIView):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer

class AdminReplyEmailView(APIView):
    def post(self, request):
        to = request.data.get("to")
        subject = request.data.get("subject", "Reply from Aurora Organics")
        message = request.data.get("message", "")

        if not to or not message:
            return Response({"error": "Missing email or message"}, status=400)

        try:
            send_mail(
                subject=f"Aurora Organics: {subject}",
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to],
                fail_silently=False,
            )
            return Response({"message": "Email sent successfully!"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

@api_view(['PATCH'])
def update_order_status(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    serializer = OrderSerializer(order, data=data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ContactMessageDeleteView(APIView):
    def delete(self, request, id, format=None):
        try:
            message = ContactMessage.objects.get(id=id)
            message.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ContactMessage.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        


# Admin view (list + add new)
class CarouselImageAdminView(generics.ListCreateAPIView):
    queryset = CarouselImage.objects.all().order_by('order')
    serializer_class = CarouselImageSerializer

class CarouselImageDetailView(RetrieveUpdateDestroyAPIView):
    queryset = CarouselImage.objects.all()
    serializer_class = CarouselImageSerializer
    lookup_field = 'pk'

class FAQListCreateView(generics.ListCreateAPIView):
    queryset = FAQ.objects.all().order_by('-created_at')
    serializer_class = FAQSerializer

class FAQDeleteView(generics.DestroyAPIView):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    lookup_field = 'pk'

@api_view(['GET', 'POST'])
def blog_list_create(request):
    if request.method == 'GET':
        blogs = BlogPost.objects.order_by('-created_at')
        serializer = BlogPostSerializer(blogs, many=True)
        return Response(serializer.data)
    
    if request.method == 'POST':
        serializer = BlogPostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_blog(request, id):
    try:
        blog = BlogPost.objects.get(id=id)
        blog.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except BlogPost.DoesNotExist:
        return Response({'error': 'Blog not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
def all_ratings(request):
    ratings = ServiceRating.objects.all().order_by('-submitted_at')
    serializer = ServiceRatingSerializer(ratings, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
def toggle_rating(request, pk):
    try:
        rating = ServiceRating.objects.get(pk=pk)
        rating.approved = request.data.get('approved', not rating.approved)
        rating.save()
        serializer = ServiceRatingSerializer(rating)
        return Response(serializer.data)
    except ServiceRating.DoesNotExist:
        return Response({'error': 'Rating not found'}, status=404)

@api_view(['DELETE'])
def delete_rating(request, pk):
    try:
        rating = ServiceRating.objects.get(pk=pk)
        rating.delete()
        return Response({"message": "Rating deleted."}, status=204)
    except ServiceRating.DoesNotExist:
        return Response({"error": "Rating not found"}, status=404)

@api_view(['PATCH'])
def update_consultation(request, id):
    try:
        consultation = ConsultationRequest.objects.get(id=id)
    except ConsultationRequest.DoesNotExist:
        return Response({'error': 'Consultation not found'}, status=404)

    serializer = ConsultationRequestSerializer(consultation, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
