from authapp.permissions import APIPermission
from common.constants import PermissionKeys
from common.serializers import SkillRequestSerializer, SkillSerializer, IndustryRequestSerializer, IndustrySerializer, \
    IndustryListRequestSerializer

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from drf_yasg.utils import swagger_auto_schema

from common.service import UserSkillService, UserIndustryService, FeatureFlagService, HealthCheckService


class SkillAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.SKILL_PERMISSIONS

    @swagger_auto_schema(request_body=SkillRequestSerializer(),
                         responses={status.HTTP_201_CREATED: SkillSerializer()})
    def post(self, request):
        service = UserSkillService()
        request_serializer = SkillRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        skill = service.create_skill(
            request_serializer.validated_data)
        response_serializer = SkillSerializer(skill)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class SkillDetailsAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.SKILL_PERMISSIONS

    def delete(self, request, skill_id):
        service = UserSkillService()
        service.delete_skill(skill_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class IndustryAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.INDUSTRY_PERMISSIONS

    @swagger_auto_schema(request_body=IndustryRequestSerializer(),
                         responses={status.HTTP_201_CREATED: IndustrySerializer()})
    def post(self, request):
        service = UserIndustryService()
        request_serializer = IndustryRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        industry = service.create_industry(
            request_serializer.validated_data)
        response_serializer = IndustrySerializer(industry)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(query_serializer=IndustryListRequestSerializer(),
                         responses={status.HTTP_200_OK: IndustrySerializer()})
    def get(self, request):
        service = UserIndustryService()
        request_serializer = IndustryListRequestSerializer(data=request.GET)
        request_serializer.is_valid(raise_exception=True)
        industry = service.list_industry(request_serializer.validated_data)
        response_serializer = IndustrySerializer(industry, many=True)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class UserIndustryAPIView(APIView):
    permission_classes = []
    permissions = PermissionKeys.INDUSTRY_PERMISSIONS

    @swagger_auto_schema(query_serializer=IndustryListRequestSerializer(),
                         responses={status.HTTP_200_OK: IndustrySerializer()})
    def get(self, request):
        service = UserIndustryService()
        request_serializer = IndustryListRequestSerializer(data=request.GET)
        request_serializer.is_valid(raise_exception=True)
        industry = service.list_industry(request_serializer.validated_data)
        response_serializer = IndustrySerializer(industry, many=True)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class IndustryDetailsAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.INDUSTRY_PERMISSIONS

    def delete(self, request, industry_id):
        service = UserIndustryService()
        service.delete_industry(industry_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class FeatureFlagAPIView(APIView):

    def get(self, request):
        service = FeatureFlagService()
        response = service.get_feature_flags()
        return Response(response, status=status.HTTP_200_OK)


class HealthCheckAPIView(APIView):

    def get(self, request):
        health_service = HealthCheckService()
        health_data = health_service.get_health_status()
        status_code = status.HTTP_200_OK if health_data["status"] else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(health_data, status=status_code)
