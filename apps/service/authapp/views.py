from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from authapp.permissions import APIPermission
from authapp.constants import RequestKeys, PermissionKeys
from authapp.serializers import LoginRequestSerializer, LoginResponseSerializer, JWTResponseSerializer
from authapp.services import LoginService, JWTService


class LoginAPIView(APIView):
    permission_classes = []

    @swagger_auto_schema(request_body=LoginRequestSerializer(), responses={200: LoginResponseSerializer()})
    def post(self, request):
        """
        API to authenticate a user.
        """
        service = LoginService()
        request_serializer = LoginRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        code = request_serializer.validated_data.get(RequestKeys.CODE)
        response = service.login(code=code)
        response_serializer = LoginResponseSerializer(response, context={'email': response['user']})
        response = response_serializer.data
        return Response(response, status=status.HTTP_200_OK)


class HasuraJWTService(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.GENERATE_HASURA_JWT_PERMISSION

    @swagger_auto_schema(responses={200: JWTResponseSerializer()})
    def get(self, request):
        """
        API to retrieve a temporary JWT.
        """
        service = JWTService()
        token = service.generate_hasura_jwt(request.user)
        response = JWTResponseSerializer(token)
        return Response(response.data, status=status.HTTP_200_OK)
