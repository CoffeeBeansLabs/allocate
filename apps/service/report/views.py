from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from authapp.permissions import APIPermission
from report.constant import RequestKeys

from report.services import ReportService
from report.serializers import (ReportDateRequestSerializer, ReportCafeResponseSerializer, json_to_csv,
                                ReportLocationRequestSerializer, ReportLocationResponseSerializer,
                                ReportCommonRequestSerializer,
                                ReportLastWorkingDayResponseSerializer, ReportClientResponseSerializer,
                                ReportPotentialCafeResponseSerializer,
                                ReportAnniversaryResponseSerializer)
from user.constants import PermissionKeys


class ReportCafeAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_DETAIL_PERMISSIONS

    @swagger_auto_schema(query_serializer=ReportDateRequestSerializer(),
                         responses={status.HTTP_200_OK: ReportCafeResponseSerializer()})
    def get(self, request):
        service = ReportService()

        req_serializer = ReportDateRequestSerializer(data=request.GET)
        req_serializer.is_valid(raise_exception=True)

        start_date = req_serializer.validated_data.get(RequestKeys.START_DATE)
        end_date = req_serializer.validated_data.get(RequestKeys.END_DATE)

        users = service.report_cafe_users(start_date, end_date)
        emp_response_serializer = ReportCafeResponseSerializer(users, many=True)
        response = json_to_csv(emp_response_serializer.data)

        return response


class ReportPotentialCafeAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_DETAIL_PERMISSIONS

    @swagger_auto_schema(query_serializer=ReportCommonRequestSerializer(),
                         responses={status.HTTP_200_OK: ReportPotentialCafeResponseSerializer()})
    def get(self, request):
        service = ReportService()
        req_serializer = ReportCommonRequestSerializer(data=request.GET)
        req_serializer.is_valid(raise_exception=True)

        users = service.report_potential_cafe_users()
        emp_response_serializer = ReportPotentialCafeResponseSerializer(users, many=True)
        response = json_to_csv(emp_response_serializer.data)

        return response


class ReportLocationAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_DETAIL_PERMISSIONS

    @swagger_auto_schema(query_serializer=ReportLocationRequestSerializer(),
                         responses={status.HTTP_200_OK: ReportLocationResponseSerializer()})
    def get(self, request):
        service = ReportService()
        req_serializer = ReportLocationRequestSerializer(data=request.GET)
        req_serializer.is_valid(raise_exception=True)

        locations = req_serializer.validated_data.get(RequestKeys.LOCATION).split(",")

        users = service.report_location_users(locations)
        emp_response_serializer = ReportLocationResponseSerializer(users, many=True)
        response = json_to_csv(emp_response_serializer.data)

        return response


class ReportLastWorkingDayAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_DETAIL_PERMISSIONS

    @swagger_auto_schema(query_serializer=ReportDateRequestSerializer(),
                         responses={status.HTTP_200_OK: ReportLastWorkingDayResponseSerializer()})
    def get(self, request):
        service = ReportService()

        req_serializer = ReportDateRequestSerializer(data=request.GET)
        req_serializer.is_valid(raise_exception=True)

        start_date = req_serializer.validated_data.get(RequestKeys.START_DATE)
        end_date = req_serializer.validated_data.get(RequestKeys.END_DATE)

        users = service.report_last_working_day_users(start_date, end_date)
        emp_response_serializer = ReportLastWorkingDayResponseSerializer(users, many=True)
        response = json_to_csv(emp_response_serializer.data)

        return response


class ReportClientAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_DETAIL_PERMISSIONS

    @swagger_auto_schema(query_serializer=ReportDateRequestSerializer(),
                         responses={status.HTTP_200_OK: ReportClientResponseSerializer()})
    def get(self, request):
        service = ReportService()

        req_serializer = ReportDateRequestSerializer(data=request.GET)
        req_serializer.is_valid(raise_exception=True)

        start_date = req_serializer.validated_data.get(RequestKeys.START_DATE)
        end_date = req_serializer.validated_data.get(RequestKeys.END_DATE)

        users = service.report_client_users(start_date, end_date)
        emp_response_serializer = ReportClientResponseSerializer(users, many=True)
        response = json_to_csv(emp_response_serializer.data)

        return response


class ReportAnniversaryAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.USER_DETAIL_PERMISSIONS

    @swagger_auto_schema(query_serializer=ReportCommonRequestSerializer(),
                         responses={status.HTTP_200_OK: ReportAnniversaryResponseSerializer()})
    def get(self, request):
        service = ReportService()
        req_serializer = ReportCommonRequestSerializer(data=request.GET)
        req_serializer.is_valid(raise_exception=True)

        users = service.report_anniversary_users()
        emp_response_serializer = ReportAnniversaryResponseSerializer(users, many=True)
        response = json_to_csv(emp_response_serializer.data)

        return response
