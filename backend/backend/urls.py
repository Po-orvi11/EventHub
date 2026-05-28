from django.contrib import admin
from django.urls import path,include
from api.views import RegisterView
from django.conf import settings
from django.conf.urls.static import (static)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/register/',RegisterView.as_view(),name='register'),
    path('api/token/',TokenObtainPairView.as_view(),name='login'),
    path('api/token/refresh/',TokenRefreshView.as_view(),name='refresh'),
    path('api/', include('api.urls')),
]
urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)