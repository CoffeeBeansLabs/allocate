from django.urls import path

from report.views import ReportCafeAPIView, ReportPotentialCafeAPIView, ReportLocationAPIView, \
    ReportLastWorkingDayAPIView, ReportClientAPIView, ReportAnniversaryAPIView

urlpatterns = [
    path('cafe/', ReportCafeAPIView.as_view(), name='cafe_reports'),
    path('potential_cafe/', ReportPotentialCafeAPIView.as_view(), name='potential_cafe_reports'),
    path('location/', ReportLocationAPIView.as_view(), name='location_reports'),
    path('last_working_day/', ReportLastWorkingDayAPIView.as_view(), name='last_working_day_reports'),
    path('client/', ReportClientAPIView.as_view(), name='client_reports'),
    path('anniversary/', ReportAnniversaryAPIView.as_view(), name='anniversary_reports'),
]
