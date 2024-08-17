from django.urls import path

from common.view import SkillAPIView, IndustryAPIView, SkillDetailsAPIView, IndustryDetailsAPIView, \
    UserIndustryAPIView, FeatureFlagAPIView, HealthCheckAPIView

urlpatterns = [
    path('skill/', SkillAPIView.as_view(), name='skill'),
    path('skill/<int:skill_id>/',
         SkillDetailsAPIView.as_view(), name='skill_details'),
    path('industry/', IndustryAPIView.as_view(), name='industry'),
    path('user_industry/', UserIndustryAPIView.as_view(), name='user_industry'),
    path('industry/<int:industry_id>/',
         IndustryDetailsAPIView.as_view(), name='industry_details'),
    path('feature-flag/', FeatureFlagAPIView.as_view(), name='feature_flags'),
    path('health/', HealthCheckAPIView.as_view(), name='health_check')
]
