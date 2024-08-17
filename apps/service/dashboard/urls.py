from django.urls import path

from dashboard.views import DashboardEmployeesDetailsAPIView, DashboardCurrentAllocationAPIView, \
    DashboardClientAndProjectAPIView, DashboardPeopleAPIView, DashboardCafeAndPotentialAPIView, \
    DashboardAnniversariesAPIView, DashboardLastWorkingDayAPIView

urlpatterns = [
    path('employees_detail/', DashboardEmployeesDetailsAPIView.as_view(), name='dashboard_employees_detail'),
    path('current_allocation/', DashboardCurrentAllocationAPIView.as_view(), name='dashboard_current_allocation'),
    path('cafe_and_potential/', DashboardCafeAndPotentialAPIView.as_view(), name='dashboard_cafe_and_potential'),
    path('people/', DashboardPeopleAPIView.as_view(), name='dashboard_people'),
    path('anniversaries/<int:month>/<int:year>', DashboardAnniversariesAPIView.as_view(),
         name='dashboard_anniversaries'),
    path('last_working_day/<int:month>/<int:year>', DashboardLastWorkingDayAPIView.as_view(),
         name='dashboard_last_working_day'),
    path('client_and_project/', DashboardClientAndProjectAPIView.as_view(), name='dashboard_client_and_projects')
]
