from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from myproject.health import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('aurora.urls')),
    path('api/admin/', include('adminpanel.urls')),  
    path('', include('django.contrib.auth.urls')),  # enables default auth views like password reset
    path('health/', health_check, name='health_check'),
]

# 👇 Enable media file serving (images, uploads)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)