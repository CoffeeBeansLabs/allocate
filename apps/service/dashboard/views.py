from collections import OrderedDict

from rest_framework.views import APIView
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from authapp.permissions import APIPermission
from dashboard.constant import RequestKeys, ResponseKeys, ServiceKeys, SerializerKeys
from dashboard.serializers import (
    DashboardEmployeesDetailsRequestSerializer,
    DashboardEmployeesDetailsResponseSerializer,
    DashboardCurrentAllocationRequestSerializer,
    DashboardCafeAndPotentialRequestSerializer,
    DashboardPeopleRequestSerializer,
    DashboardClientAndProjectsRequestSerializer,
    DashboardEmployeesSkillDetailsResponseSerializer,
    DashboardEmployeesIndustriesResponseSerializer,
    DashboardEmployeesDataResponseSerializer,
    DashboardRetrieveClientAllocationSerializer,
    DashboardRetrieveIndustryCountSerializer,
    dashboard_role_name_experience_bucket_serializer,
    DashboardEmployeesSkillExperienceDetailsResponseSerializer,
    DashboardOpenPositionsProjectRoleResponseSerializer,
    DashboardProjectAllocationProjectRoleResponseSerializer
)
from dashboard.services import DashboardService
from dashboard.constant import PermissionKeys


class DashboardEmployeesDetailsAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.DASHBOARD_PERMISSIONS

    @swagger_auto_schema(responses={status.HTTP_200_OK: DashboardEmployeesDetailsResponseSerializer()})
    def get(self, request):
        service = DashboardService()

        req_serializer = DashboardEmployeesDetailsRequestSerializer(data=request.GET)
        req_serializer.is_valid(raise_exception=True)

        skills_sort_asc = req_serializer.validated_data.get(RequestKeys.SKILLS_SORT_ASCENDING)
        open_positions_sort_asc = req_serializer.validated_data.get(RequestKeys.OPEN_POSITIONS_SORT_ASCENDING)
        project_id = req_serializer.validated_data.get(RequestKeys.PROJECT_ID)
        role_id = req_serializer.validated_data.get(RequestKeys.ROLE_ID)

        users = service.dashboard_employees_detail()
        emp_response_serializer = DashboardEmployeesDetailsResponseSerializer(users)
        skills = service.dashboard_skill('cafe', skills_sort_asc)
        open_positions_roles = service.dashboard_project_open_position(project_id, role_id, open_positions_sort_asc)
        open_positions_response = DashboardOpenPositionsProjectRoleResponseSerializer(open_positions_roles, many=True,
                                                                                      context={
                                                                                          SerializerKeys.ROLE_ID:
                                                                                              role_id,
                                                                                          SerializerKeys.PROJECT_ID:
                                                                                              project_id})
        cafe_skill_response_serializer = DashboardEmployeesSkillDetailsResponseSerializer(skills)
        response = {ResponseKeys.DATA: {ResponseKeys.EMPLOYEE_DATA: emp_response_serializer.data,
                                        ResponseKeys.CAFE_EMPLOYEE_SKILLS: cafe_skill_response_serializer.data,
                                        ResponseKeys.OPEN_POSITIONS: open_positions_response.data}}
        return Response(response, status=status.HTTP_200_OK)


class DashboardCurrentAllocationAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.DASHBOARD_PERMISSIONS

    @swagger_auto_schema(responses={status.HTTP_200_OK: DashboardEmployeesSkillDetailsResponseSerializer()})
    def get(self, request):
        req_serializer = DashboardCurrentAllocationRequestSerializer(data=request.GET)
        req_serializer.is_valid(raise_exception=True)

        alloc_sort_asc = req_serializer.validated_data.get(RequestKeys.PROJECT_ALLOCATION_SORT_ASCENDING)
        role_breakup_sort_asc = req_serializer.validated_data.get(RequestKeys.ROLE_BREAKUP_SORT_ASCENDING)
        overall_sort_asc = req_serializer.validated_data.get(RequestKeys.OVERALL_SKILLS_SORT_ASCENDING)
        project_id = req_serializer.validated_data.get(RequestKeys.PROJECT_ID)
        role_id = req_serializer.validated_data.get(RequestKeys.ROLE_ID)

        service = DashboardService()
        users = service.dashboard_allocated_employee()
        users_skill = dashboard_role_name_experience_bucket_serializer(users)
        overall_skills = service.dashboard_skill()
        overall_skill_response = DashboardEmployeesSkillDetailsResponseSerializer(overall_skills)
        allocated_projects = service.dashboard_project_allocation(project_id, role_id, alloc_sort_asc)
        project_allocations_count = DashboardProjectAllocationProjectRoleResponseSerializer(allocated_projects,
                                                                                            many=True,
                                                                                            context={
                                                                                                SerializerKeys.ROLE_ID:
                                                                                                    role_id,
                                                                                                SerializerKeys
                                                                                                .PROJECT_ID: project_id
                                                                                            })

        # sorting
        users_skill = OrderedDict(
            sorted(users_skill.items(), key=lambda x: x[0].lower(), reverse=not role_breakup_sort_asc))
        emp_skill_count = OrderedDict(
            sorted(overall_skill_response.data['employee_skill_count'].items(), key=lambda x: x[0].lower(),
                   reverse=not overall_sort_asc))
        overall_skill_response = {'employee_skill_count': emp_skill_count}

        response = {ResponseKeys.DATA: {ResponseKeys.PROJECT_ALLOCATION: project_allocations_count.data,
                                        ResponseKeys.ROLE_BREAKUP: users_skill,
                                        ResponseKeys.OVERALL_EMPLOYEE_SKILLS: overall_skill_response}}

        return Response(response, status=status.HTTP_200_OK)


class DashboardCafeAndPotentialAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.DASHBOARD_PERMISSIONS

    @swagger_auto_schema(responses={status.HTTP_200_OK: DashboardEmployeesSkillDetailsResponseSerializer()})
    def get(self, request):
        service = DashboardService()

        req_serializer = DashboardCafeAndPotentialRequestSerializer(data=request.GET)
        req_serializer.is_valid(raise_exception=True)

        cafe_sort_asc = req_serializer.validated_data.get(RequestKeys.CAFE_SORT_ASCENDING)
        potential_cafe_sort_asc = req_serializer.validated_data.get(RequestKeys.POTENTIAL_CAFE_SORT_ASCENDING)

        cafe_skills = service.dashboard_skill(ServiceKeys.CAFE, cafe_sort_asc)
        potential_skills = service.dashboard_skill(ServiceKeys.POTENTIAL_CAFE, potential_cafe_sort_asc)

        cafe_skill_response = DashboardEmployeesSkillDetailsResponseSerializer(cafe_skills)
        potential_skill_response = DashboardEmployeesSkillDetailsResponseSerializer(potential_skills)
        response = {ResponseKeys.DATA: {ResponseKeys.CAFE_EMPLOYEE_SKILLS: cafe_skill_response.data,
                                        ResponseKeys.POTENTIAL_CAFE_EMPLOYEE_SKILLS: potential_skill_response.data}}

        return Response(response, status=status.HTTP_200_OK)


class DashboardPeopleAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.DASHBOARD_PERMISSIONS

    @swagger_auto_schema(responses={status.HTTP_200_OK: DashboardEmployeesDataResponseSerializer()})
    def get(self, request):
        service = DashboardService()

        req_serializer = DashboardPeopleRequestSerializer(data=request.GET)
        req_serializer.is_valid(raise_exception=True)

        prof_sort_asc = req_serializer.validated_data.get(RequestKeys.PROFICIENCY_SORT_ASCENDING)
        exp_sort_asc = req_serializer.validated_data.get(RequestKeys.EXPERIENCE_SORT_ASCENDING)
        ind_sort_asc = req_serializer.validated_data.get(RequestKeys.INDUSTRIES_SORT_ASCENDING)

        users = service.dashboard_employees_detail()
        overall_skills = service.dashboard_skill(sort_asc=prof_sort_asc)
        overall_skill_experience = service.dashboard_skill_experience(sort_asc=exp_sort_asc)
        employee_industries = service.dashboard_employee_industries_count(sort_asc=ind_sort_asc)

        user_data_response = DashboardEmployeesDataResponseSerializer(users)
        skill_data_response = DashboardEmployeesSkillDetailsResponseSerializer(overall_skills)
        overall_skill_experience_response = DashboardEmployeesSkillExperienceDetailsResponseSerializer(
            overall_skill_experience)
        employee_industries_response = DashboardEmployeesIndustriesResponseSerializer(employee_industries)
        response = {ResponseKeys.DATA: {ResponseKeys.EMPLOYEE_DATA: user_data_response.data,
                                        ResponseKeys.OVERALL_EMPLOYEE_SKILLS: skill_data_response.data,
                                        ResponseKeys.INDUSTRY_EXPERIENCE_EMPLOYEE: employee_industries_response.data[
                                            ResponseKeys.INDUSTRY_EXPERIENCE_EMPLOYEE],
                                        ResponseKeys.OVERALL_EMPLOYEE_SKILLS_EXPERIENCE:
                                            overall_skill_experience_response.data}}

        return Response(response, status=status.HTTP_200_OK)


class DashboardClientAndProjectAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.DASHBOARD_PERMISSIONS

    @swagger_auto_schema(responses={status.HTTP_200_OK: DashboardRetrieveClientAllocationSerializer()})
    def get(self, request):
        service = DashboardService()

        req_serializer = DashboardClientAndProjectsRequestSerializer(data=request.GET)
        req_serializer.is_valid(raise_exception=True)

        ind_sort_asc = req_serializer.validated_data.get(RequestKeys.INDUSTRIES_SORT_ASCENDING)
        alloc_sort_asc = req_serializer.validated_data.get(RequestKeys.ALLOCATION_SORT_ASCENDING)

        clients = service.dashboard_client_allocation(sort_asc=alloc_sort_asc)
        client_allocation_response = DashboardRetrieveClientAllocationSerializer(clients, many=True)

        industries = service.dashboard_industries(sort_asc=ind_sort_asc)
        industry_count_response = DashboardRetrieveIndustryCountSerializer(industries, many=True)

        response = {ResponseKeys.DATA: {ResponseKeys.CLIENTS: client_allocation_response.data,
                                        ResponseKeys.INDUSTRY_COUNT: industry_count_response.data}}

        return Response(response, status=status.HTTP_200_OK)


class DashboardAnniversariesAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.DASHBOARD_PERMISSIONS

    @swagger_auto_schema(responses={status.HTTP_200_OK: DashboardEmployeesDetailsResponseSerializer()})
    def get(self, request, month, year):
        service = DashboardService()
        users_anniversaries = service.dashboard_anniversaries(month, year)
        response = {ResponseKeys.DATA: {ResponseKeys.EMPLOYEE_ANNIVERSARY: users_anniversaries}}

        return Response(response, status=status.HTTP_200_OK)


class DashboardLastWorkingDayAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_LWD_PERMISSIONS

    @swagger_auto_schema(responses={status.HTTP_200_OK: DashboardEmployeesDetailsResponseSerializer()})
    def get(self, request, month, year):
        service = DashboardService()
        users_lwd = service.dashboard_lwd(month, year)
        response = {ResponseKeys.DATA: {ResponseKeys.EMPLOYEE_LAST_WORKING_DAY: users_lwd}}

        return Response(response, status=status.HTTP_200_OK)
