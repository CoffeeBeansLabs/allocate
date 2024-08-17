class RoleKeys:
    ADMIN = 'admin'
    ACCOUNT_MANAGER = 'account_manager'
    SUPER_ADMIN = 'super_admin'
    REQUESTER = 'requester'
    USER = 'user'
    VIEWER = 'viewer'
    INVENTORY_MANAGER = 'inventory_manager'


class PermissionKeys:
    POST = "POST"
    GET = "GET"
    PATCH = "PATCH"
    PUT = "PUT"

    LOGIN_PERMISSION = "user.login"
    GENERATE_HASURA_JWT_PERMISSION = {GET: ["user.generate_jwt_token"]}


class RequestKeys:
    CODE = 'code'


class ResponseKeys:
    ACCESS = 'access'
    REFRESH = 'refresh'
    USER = 'user'


class ErrorMessages:
    GOOGLE_AUTHENTICATION_FAILED = 'Google authentication failed.'
    SOMETHING_WENT_WRONG = 'Something went wrong. Please try again.'
    UNAUTHORIZED_LOGIN = 'You are not authorized to access this application. Please try with another email.'


class URLs:
    GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
    GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
