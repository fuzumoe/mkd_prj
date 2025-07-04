from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

class AnalysisHistory(models.Model):
    user_email = models.EmailField()
    skin_type = models.CharField(max_length=50)
    skin_concern = models.CharField(max_length=50)
    predicted_condition = models.CharField(max_length=100, blank=True, null=True)
    confidence = models.FloatField(blank=True, null=True)
    image_data = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_email} - {self.skin_concern} at {self.created_at}"

class RegisteredUser(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # Use proper hashing in production.
    name = models.CharField(max_length=100)
    age = models.CharField(max_length=20)
    # Change allergies from TextField to JSONField.
    allergies = models.JSONField(blank=True, default=list)
    profileImage = models.TextField(blank=True)

    def __str__(self):
        return self.email

class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    suitable_for = models.JSONField(default=list, blank=True)  # New field
    targets = models.JSONField(default=list, blank=True)       # New field

    def __str__(self):
        return self.name
    
class CartItem(models.Model):
    user_email = models.EmailField()
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    product_name = models.CharField(max_length=100, blank=True)
    product_image = models.TextField(blank=True)
    product_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    ordered = models.BooleanField(default=False)  # <- NEW FIELD

# Model for orders (optional, if you want to store placed orders)
from django.db import models

class Order(models.Model):
    user_email = models.EmailField()
    shipping_first_name = models.CharField(max_length=255, blank=True, null=True)
    shipping_last_name = models.CharField(max_length=255, blank=True, null=True)
    shipping_email = models.EmailField(blank=True, null=True)
    shipping_address = models.CharField(max_length=255)
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100, blank=True, null=True)
    shipping_zip = models.CharField(max_length=20, blank=True, null=True)
    shipping_country = models.CharField(max_length=100)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='pending')
    payment_status = models.CharField(
        max_length=10,
        choices=[('paid', 'Paid'), ('unpaid', 'Unpaid')],
        default='unpaid'
    )
    date = models.DateTimeField(auto_now_add=True)

    # 🚀 VERY IMPORTANT: ManyToMany with CartItem
    items = models.ManyToManyField('CartItem')

    def __str__(self):
        return f"Order {self.id} - {self.user_email}"

    
class ConsultationRequest(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    concern = models.TextField()
    preferred_date = models.DateField()
    preferred_time = models.TimeField(blank=True, null=True)
    additional_info = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    # In models.py
    assigned_consultant = models.CharField(max_length=100, blank=True, null=True)
    confirmed_date = models.DateField(blank=True, null=True)
    confirmed_time = models.TimeField(blank=True, null=True)
    meeting_type = models.CharField(max_length=20, choices=[('online', 'Online'), ('physical', 'Physical')], default='physical')
    meeting_link = models.URLField(blank=True, null=True)
    consultation_fee = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    payment_confirmed = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default='pending')  # pending/confirmed/completed

    def __str__(self):
        return f"{self.name} - {self.email}"

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=200)
    order_number = models.CharField(max_length=100, blank=True)
    inquiry_type = models.CharField(max_length=50)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject} from {self.email}"
    
class CarouselImage(models.Model):
    title = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='carousel/')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title or f"Slide {self.pk}"
    
class FAQ(models.Model):
    question = models.TextField()
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question[:50]
    
class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    excerpt = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ServiceRating(models.Model):
    user_email = models.EmailField()
    user_name = models.CharField(max_length=100, blank=True, null=True)
    profile_image_url = models.URLField(blank=True)
    stars = models.PositiveIntegerField()
    comment = models.TextField(blank=True)
    approved = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_name} ({self.stars}★)"

