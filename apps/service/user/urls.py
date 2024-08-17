from django.urls import path

from user.views import UserRoleAPIView, UserAPIView, UserDetailsAPIView, UserEditPermissionAPIView, \
    GroupHasPermissionAPIView, UserSkillIndustryAPIView, EditUserExperienceAPIView, UserRemoveLastWorkingDayAPIView, \
    ListUserAndRolesAPIView, EditUserGroupsAPIView, GetUserGroupsAPIView, UserCountriesAPIView, UserCitiesAPIView

urlpatterns = [
    path('create_role/', UserRoleAPIView.as_view(), name='create_role'),

    path('', UserAPIView.as_view(), name='list_users'),
    path('<int:user_id>/', UserDetailsAPIView.as_view(), name='user_details'),
    path('skill_industry/<int:user_id>/', UserSkillIndustryAPIView.as_view(), name='user_skill_industry_details'),
    path('edit_user_experience/<int:user_id>/', EditUserExperienceAPIView.as_view(), name='edit_user_experience'),
    path('add_user_groups_permission/', UserEditPermissionAPIView.as_view(), name='add_user_groups_permission'),
    path('form_permission_auth/', GroupHasPermissionAPIView.as_view(), name='form_permission_auth'),
    path('remove_lwd/<int:user_id>/', UserRemoveLastWorkingDayAPIView.as_view(), name='user_remove_LWD'),
    path('user-management-view/', ListUserAndRolesAPIView.as_view(), name='user-management-view'),
    path('edit-user-group/', EditUserGroupsAPIView.as_view(), name='edit-user-group'),
    path('get-user-groups/', GetUserGroupsAPIView.as_view(), name='get-user-groups'),
    path('get-user-countries/', UserCountriesAPIView.as_view(), name='get-user-countries'),
    path('get-user-cities/', UserCitiesAPIView.as_view(), name='get-user-cities')
]
