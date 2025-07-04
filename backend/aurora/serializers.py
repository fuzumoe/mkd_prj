from rest_framework import serializers
from .models import (
    AnalysisHistory, 
    RegisteredUser, 
    Product, 
    CartItem, 
    Order,
    ConsultationRequest,
    ContactMessage,
    CarouselImage,
    FAQ,
    BlogPost,
    ServiceRating,
    )

class AnalysisHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisHistory
        fields = '__all__'

class RegisteredUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegisteredUser
        fields = ['email', 'password','name', 'age', 'allergies', 'profileImage']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.CharField(source='product.image', read_only=True)  # 👈 not ImageField!

    class Meta:
        model = CartItem
        fields = [
            'id',
            'user_email',
            'product',
            'product_name',
            'product_price',
            'product_image',
            'quantity',
            'ordered',
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'user_email',
            'shipping_first_name',
            'shipping_last_name',
            'shipping_email',
            'shipping_address',
            'shipping_city',
            'shipping_state',
            'shipping_zip',
            'shipping_country',
            'total',
            'payment_status',
            'status',
            'date',    # 🚀 important for charts
            'items',
        ]


class ConsultationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConsultationRequest
        fields = '__all__'


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'

class CarouselImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarouselImage
        fields = ['id', 'title', 'image', 'order', 'is_active']

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'created_at']

class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'body', 'excerpt', 'created_at']

class ServiceRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRating
        fields = '__all__'
