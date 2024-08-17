DEFAULT_PAGE_NUMBER = 1
DEFAULT_PAGE_SIZE = 6


class PermissionKeys:
    POST = 'POST'
    GET = 'GET'
    PUT = 'PUT'

    CLIENT_PERMISSIONS = {
        POST: ['client.add_client'],
        GET: ['client.view_client'],
        PUT: ['client.change_client']
    }

    CLIENT_CREATION_DROPDOWN_PERMISSIONS = {
        GET: ['client.view_client']
    }

    MARK_DORMANT_PERMISSION = 'client.mark_client_dormant'
    ACCOUNT_MANAGER_PERMISSION = 'client.client_account_manager'


class RequestKeys:
    STATUS = 'status'
    POCS = 'pocs'
    PAGE = 'page'
    SIZE = 'size'
    SORT_BY = 'sort_by'


class ResponseKeys:
    CLIENT = 'client'
    CLIENTS = 'clients'
    COUNT = 'count'
    DROPDOWNS = 'dropdowns'
    STATUS = 'status'
    INDUSTRIES = 'industries'
    ACCOUNT_MANAGERS = 'account_managers'


class ErrorMessages:
    INVALID_CLIENT_ID = 'Invalid client ID.'
    DORMANT_PERMISSION_DENIED = 'You do not have permission to make the client dormant.'
    ALL_PROJECT_RELATED_TO_CLIENT_IS_NOT_CLOSED = 'All projects related to this client is not closed'
