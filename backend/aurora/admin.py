from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Product, 
    CartItem, 
    Order, 
    ContactMessage, 
    RegisteredUser, 
    AnalysisHistory, 
    ConsultationRequest,
    CustomUser,
    CarouselImage,
    BlogPost,
    )

admin.site.register(Product)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(ContactMessage)
admin.site.register(AnalysisHistory)
admin.site.register(ConsultationRequest)

@admin.register(RegisteredUser)
class RegisteredUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'age')
    search_fields = ('email', 'name')


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active')
    ordering = ('email',)
    search_fields = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )

admin.site.register(CustomUser, CustomUserAdmin)

@admin.register(CarouselImage)
class CarouselImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_active')
    list_editable = ('order', 'is_active')

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    search_fields = ('title', 'body')
    list_filter = ('created_at',)