from django.urls import path

from project.views import ProjectAPIView, ProjectCreationDropdownsAPIView, ProjectDetailAPIView, \
    ProjectPositionDropdownsAPIView, ProjectPositionAPIView, ProjectPositionDetailAPIView, \
    ProjectAllocationAPIView, RetrieveProjectTimelineAPIView, ProjectAllocationRequestAPIView, \
    ProjectAllocationRequestDetailAPIView, NotificationAPIView, ProjectAllocationDetailAPIView, \
    NotificationDetailAPIView, ProjectRoleAPIView, NotificationMarkReadAPIView

urlpatterns = [
    path('', ProjectAPIView.as_view(), name='project'),

    path('<int:project_id>/', ProjectDetailAPIView.as_view(), name='project-detail'),

    path('creation-dropdowns/', ProjectCreationDropdownsAPIView.as_view(),
         name='project-creation-dropdowns'),

    path('position-dropdowns/', ProjectPositionDropdownsAPIView.as_view(),
         name='project-position-dropdowns'),

    path('positions/', ProjectPositionAPIView.as_view(), name='project-position'),

    path('positions/<int:position_id>/',
         ProjectPositionDetailAPIView.as_view(), name='project-position-detail'),

    path('project-role/<int:project_role_id>',
         ProjectRoleAPIView.as_view(), name='project-role'),

    path('allocation/', ProjectAllocationAPIView.as_view(),
         name='project-allocation'),
    path('allocation/<int:allocation_id>/',
         ProjectAllocationDetailAPIView.as_view(), name='project-allocation-detail'),

    path('<int:project_id>/project-timeline/',
         RetrieveProjectTimelineAPIView.as_view(), name='project-timeline'),

    path('allocation-request/', ProjectAllocationRequestAPIView.as_view(),
         name='project-allocation-request'),

    path('allocation-request/<int:allocation_request_id>/', ProjectAllocationRequestDetailAPIView.as_view(),
         name='project-allocation-request-detail'),

    path('notification/', NotificationAPIView.as_view(), name='notification'),
    path('notification/<int:notification_id>/read_notification/', NotificationDetailAPIView.as_view(),
         name='notification-detail'),
    path('notification/mark-all-read/', NotificationMarkReadAPIView.as_view(),
         name='notification-mark-all-read')

]
