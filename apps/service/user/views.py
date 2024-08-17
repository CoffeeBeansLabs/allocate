import datetime

from django.db.models import Q, F, IntegerField, ExpressionWrapper, Sum, Value
from django.db.models.functions import Extract, Floor, Coalesce, Concat, Cast
from django.utils import timezone
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from authapp.permissions import APIPermission
from helpers.exceptions import InvalidRequest
from helpers.pagination import paginate
from user.constants import PermissionKeys, ResponseKeys, RequestKeys, SuccessMessages
from user.constants import SerializerKeys, ErrorMessages
from user.serializers import RoleRequestSerializer, RoleSerializer, ListUserRequestSerializer, \
    ListUserResponseSerializer, UserDetailsResponseSerializer, UserSkillIndustryResponseSerializer, \
    UserSkillIndustryRequestSerializer, EditUserRequestSerializer, EditUserExperienceRequestSerializer, \
    EditUserExperienceResponseSerializer, ListUserManagemenetRequestSerializer, ListUserManagementResponseSerializer, \
    EditMultipleUserGroupRequestSerializer, ListCitiesResponseSerializer, ListCountriesResponseSerializer, \
    ListCitiesRequestSerializer, ListGroupSerializer
from user.services import UserRoleService, UserService, UserEditPermissionService, UserManagementService, \
    GroupService, LocationService


class UserRoleAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_PERMISSIONS

    @swagger_auto_schema(request_body=RoleRequestSerializer(),
                         responses={status.HTTP_201_CREATED: RoleSerializer()})
    def post(self, request):
        service = UserRoleService()
        request_serializer = RoleRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        role = service.create_role(request_serializer.validated_data)
        response_serializer = RoleSerializer(role)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class UserAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_DETAIL_PERMISSIONS

    def get_sorted_users(self, sort_by, users):
        if sort_by == 'experience_desc':
            users = users.order_by('-user_experience', 'user_name')
        if sort_by == 'experience_asc':
            users = users.order_by('user_experience', 'user_name')
        if sort_by == 'availability_desc':
            users = users.order_by('utilization_sum', 'user_name')
        if sort_by == 'availability_asc':
            users = users.order_by('-utilization_sum', 'user_name')
        if sort_by == 'employee_id_asc':
            users = users.exclude(
                Q(employee_id='') | Q(employee_id__isnull=True) | Q(
                    employee_id__regex=r'[^\d]+')
            ).annotate(
                employee_id_int=ExpressionWrapper(
                    Cast('employee_id', IntegerField()), output_field=IntegerField())
            ).order_by('employee_id_int')
        if sort_by == 'employee_id_desc':
            users = users.exclude(
                Q(employee_id='') | Q(employee_id__isnull=True) | Q(
                    employee_id__regex=r'[^\d]+')
            ).annotate(
                employee_id_int=ExpressionWrapper(
                    Cast('employee_id', IntegerField()), output_field=IntegerField())
            ).order_by('-employee_id_int')
        if sort_by == 'lwd_asc':
            users = users.order_by('last_working_day', 'user_name')
        if sort_by == 'lwd_desc':
            users = users.order_by('-last_working_day', 'user_name')
        if not sort_by:
            users = users.order_by('user_name')
        return users

    @swagger_auto_schema(request_body=ListUserRequestSerializer(),
                         responses={status.HTTP_200_OK: ListUserResponseSerializer(many=True)})
    def post(self, request):
        """
        API to list users.
        """
        service = UserService()
        request_serializer = ListUserRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        response_date_start = request_serializer.validated_data.get(
            RequestKeys.RESPONSE_DATE_START)
        response_date_end = request_serializer.validated_data.get(
            RequestKeys.RESPONSE_DATE_END)

        page = request_serializer.validated_data.get(RequestKeys.PAGE)
        size = request_serializer.validated_data.get(RequestKeys.SIZE)
        project = request_serializer.validated_data.get(RequestKeys.PROJECT)
        user_function = request_serializer.validated_data.get(
            RequestKeys.FUNCTION)
        skills = request_serializer.validated_data.get(RequestKeys.SKILLS)
        experience_range_start = request_serializer.validated_data.get(
            RequestKeys.EXPERIENCE_RANGE_START)
        experience_range_end = request_serializer.validated_data.get(
            RequestKeys.EXPERIENCE_RANGE_END)
        availability = request_serializer.validated_data.get(
            RequestKeys.AVAILABILITY)
        sort_by = request_serializer.validated_data.get(RequestKeys.SORT_BY)

        if experience_range_end and experience_range_start and experience_range_end < experience_range_start:
            raise InvalidRequest(
                ErrorMessages.EXP_START_RANGE_GREATER_THAN_EXP_END_RANGE)

        users = service.list_users(request_serializer.validated_data)
        users = users.annotate(
            career_break_month=Coalesce('career_break_months', 0),
            user_name=Concat('first_name', Value(' '), 'last_name'),
            user_experience=Coalesce(ExpressionWrapper(
                Floor((Extract(timezone.now().date() - F('career_start_date'), 'day')) / 30) - F(
                    'career_break_month'),
                output_field=IntegerField(),
            ), 0))

        users = users.annotate(
            utilization_sum=Coalesce(
                Sum('allocation__utilization',
                    filter=(Q(allocation__start_date__lte=datetime.date.today()) &
                            (Q(allocation__end_date__gte=datetime.date.today()) | Q(allocation__end_date=None)))), 0)
        )

        if project:
            users = users.filter(
                allocation__position__project_role__project__in=project)

        if skills:
            users = users.filter(proficiency_mapping__skill__in=skills, proficiency_mapping__rating__gt=0)

        if user_function:
            users = users.filter(function=user_function)

        if experience_range_start is None:
            experience_range_start = 0

        if experience_range_end is None:
            experience_range_end = 50

        if experience_range_start is not None:
            users = users.filter(Q(user_experience__gte=experience_range_start * 12),
                                 Q(user_experience__lt=experience_range_end * 12))

        if availability is not None and availability <= 100:
            users = users.filter(utilization_sum__lte=100 - availability)

        users = self.get_sorted_users(sort_by, users)

        paginated_users = paginate(users, page, size)

        response_serializer = ListUserResponseSerializer(paginated_users,
                                                         many=True,
                                                         context={
                                                             SerializerKeys.RESPONSE_DATE_START: response_date_start,
                                                             SerializerKeys.RESPONSE_DATE_END: response_date_end,
                                                             SerializerKeys.SKILLS: skills,
                                                             'projects': project}
                                                         )
        response = {ResponseKeys.USERS: response_serializer.data,
                    ResponseKeys.COUNT: len(users)}
        return Response(response, status=status.HTTP_200_OK)


class UserDetailsAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_DETAIL_PERMISSIONS

    @swagger_auto_schema(responses={status.HTTP_200_OK: UserDetailsResponseSerializer()})
    def get(self, request, user_id):
        service = UserService()
        user = service.user_details(user_id)
        response_serializer = UserDetailsResponseSerializer(
            user, context={SerializerKeys.REQUEST_USER: request.user})
        response = {ResponseKeys.USER: response_serializer.data}
        return Response(response, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=EditUserRequestSerializer())
    def patch(self, request, user_id):
        service = UserService()
        request_serializer = EditUserRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        service.patch_user(user_id, request_serializer.validated_data)
        return Response(status=status.HTTP_200_OK)


class UserSkillIndustryAPIView(APIView):
    permission_classes = []
    permissions = PermissionKeys.INDUSTRY_PROFICIENCY_PERMISSION

    @swagger_auto_schema(responses={status.HTTP_200_OK: UserSkillIndustryResponseSerializer()})
    def get(self, request, user_id):
        service = UserService()
        user = service.user_details(user_id)
        response_serializer = UserSkillIndustryResponseSerializer(user)
        response = {ResponseKeys.USER: response_serializer.data}
        return Response(response, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=UserSkillIndustryRequestSerializer(),
                         responses={status.HTTP_200_OK: UserSkillIndustryResponseSerializer(many=True)})
    def post(self, request, user_id):
        service = UserService()
        request_serializer = UserSkillIndustryRequestSerializer(
            data=request.data)
        request_serializer.is_valid(raise_exception=True)
        user = service.skill_industry_edit(
            user_id, request_serializer.validated_data)
        response_serializer = UserSkillIndustryResponseSerializer(user)
        response = {ResponseKeys.USER: response_serializer.data}
        return Response(response, status=status.HTTP_200_OK)


class EditUserExperienceAPIView(APIView):
    permission_classes = []
    permissions = PermissionKeys.EDIT_USER_EXPERIENCE_PERMISSION

    @swagger_auto_schema(request_body=EditUserExperienceRequestSerializer(),
                         responses={status.HTTP_200_OK: EditUserExperienceResponseSerializer(many=True)})
    def post(self, request, user_id):
        service = UserService()
        request_serializer = EditUserExperienceRequestSerializer(
            data=request.data)
        request_serializer.is_valid(raise_exception=True)
        user = service.edit_user_experience(
            user_id, request_serializer.validated_data)
        response_serializer = EditUserExperienceResponseSerializer(user)
        response = {ResponseKeys.USER: response_serializer.data}
        return Response(response, status=status.HTTP_200_OK)


class UserRemoveLastWorkingDayAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_DETAIL_PERMISSIONS

    def patch(self, request, user_id):
        service = UserService()
        service.remove_lwd(user_id)
        return Response(status=status.HTTP_200_OK)


class UserEditPermissionAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_FORM_RELATED_PERMISSION

    def post(self, request):
        service = UserEditPermissionService()
        action = request.data.get('action')
        if action == 'assign_form_permissions':
            service.assign_form_permissions()
        if action == 'revoke_form_permissions':
            service.revoke_form_permissions()
        if action == 'assign_proficiency_mapping_permissions':
            service.assign_proficiency_mapping_permissions()
        if action == 'revoke_proficiency_mapping_permissions':
            service.revoke_proficiency_mapping_permissions()
        if action == 'assign_industry_mapping_permissions':
            service.assign_industry_mapping_permissions()
        if action == 'revoke_industry_mapping_permissions':
            service.revoke_industry_mapping_permissions()
        if action == 'assign_edit_user_experience_permissions':
            service.assign_edit_user_experience_permissions()
        if action == 'revoke_edit_user_experience_permissions':
            service.revoke_edit_user_experience_permissions()
        return Response(status=status.HTTP_200_OK)


class GroupHasPermissionAPIView(APIView):
    def post(self, request):
        service = UserEditPermissionService()
        action = request.data.get('action')
        has_permission = False
        if action == 'has_skill_permission':
            has_permission = service.has_skill_group_permission()
        if action == 'has_industry_permission':
            has_permission = service.has_industry_group_permission()
        if action == 'has_form_permission':
            has_permission = service.has_group_permission()
        if action == 'has_edit_user_experience_permissions':
            has_permission = service.has_user_experience_group_permission()
        response = {ResponseKeys.HAS_PERMISSION: has_permission}
        return Response(response, status=status.HTTP_200_OK)


class ListUserAndRolesAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_GROUP

    @swagger_auto_schema(
        query_serializer=ListUserManagemenetRequestSerializer(),
        responses={
            status.HTTP_200_OK: ListUserManagementResponseSerializer(many=True)},
    )
    def get(self, request):
        service = UserManagementService()
        request_serializer = ListUserManagemenetRequestSerializer(
            data=request.GET)
        request_serializer.is_valid(raise_exception=True)

        page = request_serializer.validated_data.pop(RequestKeys.PAGE)
        size = request_serializer.validated_data.pop(RequestKeys.SIZE)

        users = service.list_management_users(
            request_serializer.validated_data)
        paginated_users = paginate(users, page, size)

        response_serializer = ListUserManagementResponseSerializer(
            paginated_users, many=True)
        response = {
            ResponseKeys.USERS: response_serializer.data,
            ResponseKeys.COUNT: users.count(),
        }
        return Response(response, status=status.HTTP_200_OK)


class EditUserGroupsAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_GROUP

    @swagger_auto_schema(request_body=EditMultipleUserGroupRequestSerializer(many=True))
    def put(self, request):
        service = UserManagementService()
        request_serializer = EditMultipleUserGroupRequestSerializer(
            data=request.data, many=True)
        request_serializer.is_valid(raise_exception=True)
        service.update_user_group(request_serializer.validated_data)
        response = {ResponseKeys.MESSAGE: SuccessMessages.UPDATE_SUCCESS}
        return Response(response, status=status.HTTP_200_OK)


class GetUserGroupsAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_GROUP

    @swagger_auto_schema(responses={status.HTTP_200_OK: ListGroupSerializer(many=True)})
    def get(self, request):
        service = GroupService()
        groups = service.list_groups()
        response_serializer = ListGroupSerializer(groups, many=True)
        response = {
            ResponseKeys.GROUPS: response_serializer.data,
            ResponseKeys.COUNT: groups.count(),
        }
        return Response(response, status=status.HTTP_200_OK)


class UserCountriesAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_DETAIL_PERMISSIONS

    @swagger_auto_schema(responses={status.HTTP_200_OK: ListCountriesResponseSerializer()})
    def get(self, request):
        service = LocationService()
        countries = service.list_countries()
        response_serializer = ListCountriesResponseSerializer(
            {'countries': countries})
        response = {
            ResponseKeys.COUNTRIES: response_serializer.data['countries'],
            ResponseKeys.COUNT: countries.count()
        }
        return Response(response, status=status.HTTP_200_OK)


class UserCitiesAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_DETAIL_PERMISSIONS

    @swagger_auto_schema(query_serializer=ListCitiesRequestSerializer(),
                         responses={status.HTTP_200_OK: ListCitiesResponseSerializer()})
    def get(self, request):
        service = LocationService()
        request_serializer = ListCitiesRequestSerializer(data=request.GET)
        request_serializer.is_valid(raise_exception=True)

        cities = service.list_cities(request_serializer.validated_data)
        response_serializer = ListCitiesResponseSerializer({'cities': cities})
        response = {
            ResponseKeys.CITIES: response_serializer.data['cities'],
            ResponseKeys.COUNT: len(cities)
        }
        return Response(response, status=status.HTTP_200_OK)
