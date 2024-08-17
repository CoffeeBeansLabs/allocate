class PermissionKeys:
    POST = 'POST'
    GET = 'GET'
    DELETE = 'DELETE'

    SKILL_PERMISSIONS = {
        POST: ['common.add_skill'],
        DELETE: ['common.delete_skill']
    }
    INDUSTRY_PERMISSIONS = {
        POST: ['common.add_industry'],
        GET: ['common.view_industry'],
        DELETE: ['common.delete_industry']
    }


class RequestKeys:
    SEARCH = 'search'


class ResponseKeys:
    ASSET_MODULE = 'asset_module'


class ErrorMessages:
    INVALID_SKILL_ID = 'Invalid skill ID'
    INVALID_INDUSTRY_ID = 'Invalid industry ID'


class EnvironmentValues:
    ENABLED = 'enabled'
