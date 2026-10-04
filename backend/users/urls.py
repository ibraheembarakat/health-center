from django.urls import path # تربط رابط معين بداله معينه
from .views import CustomTokenObtainPairView ,LogoutView,PasswordResetView,PasswordResetConfirmView,CurrentUserView# هون ماستدعي الكلاس الوحيد يللي كتبته ضمن الفيوز
from rest_framework_simplejwt.views import TokenRefreshView # وظيفته يستقبل الريفريش توكن ويرد اكسس توكن جديد

# من احل استعداء الفيوز من كل الملف الحالي
urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='log in and token take'),
    path('auth/refresh/',TokenRefreshView.as_view(),name='refresh token'),
    path('auth/logout/',LogoutView.as_view(), name='logout'),
    path('auth/password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('auth/password-reset-confirm/',PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),
]