from rest_framework.views import exception_handler

from helpers.exceptions import ServerException
from utils.log import log_exception


def custom_exception_handler(exc, context):
    """
    Custom exception handler for views.
    """
    if isinstance(exc, ServerException):
        log_exception(exc)
    response = exception_handler(exc, context)
    if response is not None and isinstance(response.data, dict) and 'code' not in response.data:
        detail = response.data.get('detail')
        code = getattr(detail, 'code', None)
        if code is not None:
            response.data['code'] = code
    return response
