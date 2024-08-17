from rest_framework import status
from rest_framework.exceptions import APIException


class InvalidRequest(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid request.'
    default_code = 'invalid_request'


class ServerException(APIException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'Something went wrong. Please try again.'
    default_code = 'server_error'
