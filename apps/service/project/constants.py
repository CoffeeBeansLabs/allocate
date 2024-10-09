DEFAULT_PAGE_NUMBER = 1
DEFAULT_PAGE_SIZE = 6


class PermissionKeys:
    POST = 'POST'
    GET = 'GET'
    PATCH = 'PATCH'
    PUT = 'PUT'
    DELETE = 'DELETE'

    PROJECT_PERMISSIONS = {
        POST: ['project.add_project'],
        GET: ['project.view_project'],
        PATCH: ['project.change_project'],
        PUT: ['project.change_project']
    }

    PROJECT_CREATION_DROPDOWN_PERMISSIONS = {
        GET: ['project.view_project']
    }

    PROJECT_POSITION_DROPDOWN_PERMISSIONS = {
        GET: ['project.view_projectposition']
    }

    PROJECT_POSITION_PERMISSIONS = {
        POST: ['project.add_projectposition'],
        PATCH: ['project.change_projectposition'],
        DELETE: ['project.delete_projectposition']
    }

    PROJECT_ALLOCATION_PERMISSIONS = {
        POST: ['project.add_projectallocation'],
        PUT: ['project.change_projectallocation'],
        DELETE: ['project.delete_projectallocation']
    }

    PROJECT_ALLOCATION_REQUEST_PERMISSIONS = {
        POST: ['project.add_projectallocationrequest'],
        DELETE: ['project.delete_projectallocationrequest'],
        PUT: ['project.change_projectallocationrequest'],
        PATCH: ['project.change_projectallocationrequest']
    }

    NOTIFICATION_PERMISSIONS = {
        GET: ['project.view_notification'],
        PATCH: ['project.change_notification']
    }

    PRIVILEGED_STATUS_PERMISSION = 'project.set_privileged_project_status'
    ACCOUNT_MANAGER_PERMISSION = 'client.client_account_manager'
    ADMIN_NOTIFICATION_PERMISSION = 'project.admin_notification'


class RequestKeys:
    STATUS = 'status'
    POCS = 'pocs'
    PAGE = 'page'
    SIZE = 'size'
    SEARCH = 'search'
    PROJECT = 'project'
    ROLE = 'role'
    SKILLS = 'skills'
    POSITIONS = 'positions'
    CLIENT = 'client'
    UTILIZATION = 'utilization'
    START_DATE = 'start_date'
    END_DATE = 'end_date'
    POSITION = 'position'
    USER = 'user'
    TENTATIVE = 'tentative'
    RESPONSE_DATE_START = 'response_date_start'
    RESPONSE_DATE_END = 'response_date_end'
    KT_PERIOD = 'kt_period'
    ALLOCATION = 'allocation'
    UNSEEN = 'unseen'
    IS_BILLABLE = 'is_billable'


class ResponseKeys:
    PROJECT = 'project'
    PROJECTS = 'projects'
    DROPDOWNS = 'dropdowns'
    STATUS = 'status'
    ENGAGEMENTS = 'engagements'
    DELIVERY_MODES = 'delivery_modes'
    CLIENTS = 'clients'
    COUNT = 'count'
    ROLES = 'roles'
    SKILLS = 'skills'
    POSITION = 'position'
    POSITIONS = 'positions'
    PROJECT_ALLOCATION = 'project_allocation'
    USERS = 'users'
    ROW = 'row'
    MESSAGE = 'message'
    CODE = 'code'
    ACCOUNT_MANAGERS = 'account_managers'
    NOTIFICATIONS = 'notifications'


class SerializerKeys:
    RESPONSE_DATE_START = 'response_date_start'
    RESPONSE_DATE_END = 'response_date_end'
    SEARCH = 'search'
    PROJECT_ID = 'project_id'
    FILTER_USERS = 'filter_users'
    USER = 'user'
    POSITIONS = 'positions'
    UTILIZATION_SUM = 'utilization__sum'
    UTILIZATION = 'utilization'
    SKILLS = 'skills'


class ErrorMessages:
    INVALID_PROJECT_ID = 'Invalid project ID.'
    PRIVILEGED_STATUS_PERMISSION_DENIED = 'You do not have permission to set the project as {status}.'
    INVALID_POSITION_ID = 'Invalid position ID.'
    INVALID_PROJECT_ROLE_ID = 'Invalid project role ID.'
    START_DATE_GREATER_THAN_END_DATE = 'Start date cannot be greater than end date.'
    PROJECT_IS_CLOSED = 'You can not allocate talent to closed project.'
    TALENT_IS_ALREADY_ALLOCATED_TO_ROLE = 'Talent is already allocated to the given role.'
    TALENT_IS_ALREADY_ALLOCATED_DURING_THE_PERIOD = 'Talent is already allocated during the given period.'
    OTHER_TALENT_IS_ALREADY_ALLOCATED_IN_GIVEN_DATE_RANGE = 'Other talent is already allocated in give date range.'
    ALLOCATION_IS_BEYOND_POSITION_DATE_RANGE = 'Allocation date is beyond the position date range'
    POSITION_DATE_IS_BEYOND_ALLOCATION_DATE_RANGE = 'Position date is beyond the allocation date range'
    POSITION_DATE_IS_BEYOND_PROJECT_END_DATE = 'Position date is beyond the project end date'
    POSITION_START_DATE_IS_BEFORE_PROJECT_START_DATE = 'Position start date cannot be before the project start date'
    REQUESTED_UTILIZATION_GREATER_THAN_POSITION_UTILIZATION = 'Requested utilization is greater than position ' \
                                                              'utilization '
    ALL_POSITIONS_RELATED_TO_PROJECT_IS_NOT_CLOSED = 'All positions related to this project is not closed'
    INVALID_PROJECT_ALLOCATION_REQUEST_ID = 'Invalid project allocation request ID'
    INVALID_PROJECT_ALLOCATION_ID = 'Invalid project allocation ID'
    INVALID_NOTIFICATION_REQUEST = 'Invalid notification request'
    INVALID_NOTIFICATION_ID = 'Invalid notification ID'
    USER_WILL_NOT_BE_AVAILABLE_TILL_GIVEN_DATE = 'User will not be available till given date'
    USERS_ALLOCATED_TO_THIS_POSITION = 'Users allocated to this position'
    NO_AM_ASSIGNED = "No Account Manager assigned."
