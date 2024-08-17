from django.urls import path

from client.views import ClientAPIView, ClientDetailAPIView, ClientCreationDropdownsAPIView

urlpatterns = [
    path('', ClientAPIView.as_view(), name='client'),
    path('<int:client_id>/', ClientDetailAPIView.as_view(), name='client-detail'),
    path('creation-dropdowns/', ClientCreationDropdownsAPIView.as_view(), name='client-creation-dropdowns'),
]
