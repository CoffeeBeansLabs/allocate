from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from authapp.views import LoginAPIView, HasuraJWTService

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh-token'),
    path('hasura-jwt/', HasuraJWTService.as_view(), name='hasura-jwt-gen')
]
