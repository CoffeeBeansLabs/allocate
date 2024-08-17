DEFAULT_PAGE_NUMBER = 1
DEFAULT_PAGE_SIZE = 10


class PermissionKeys:
    GET = 'GET'
    POST = 'POST'

    SEARCH_TALENT_PERMISSIONS = {
        GET: ['user.search_talent'],
        POST: ['user.search_talent'],
    }


class RequestKeys:
    PAGE = 'page'
    SIZE = 'size'
    POSITION = 'position'
    SEARCH = 'search'
    RELATED_SUGGESTIONS = 'related_suggestions'
    RESPONSE_DATE_START = 'response_date_start'
    RESPONSE_DATE_END = 'response_date_end'
    START_DATE = 'start_date'
    END_DATE = 'end_date'
    SKILLS = 'skills'
    ROLE = 'role'
    ROLES = 'roles'
    EXPERIENCE_RANGE_START = 'experience_range_start'
    EXPERIENCE_RANGE_END = 'experience_range_end'
    UTILIZATION = 'utilization'
    PROJECTS = 'projects'
    STATUS = 'status'
    POCS = 'pocs'
    PROJECT = 'project'
    POSITIONS = 'positions'
    CLIENT = 'client'
    USER = 'user'
    TENTATIVE = 'tentative'
    KT_PERIOD = 'kt_period'
    ALLOCATION = 'allocation'
    LOCATIONS = 'locations'


class ResponseKeys:
    CRITERIA = 'criteria'
    TALENTS = 'talents'
    COUNT = 'count'
    PROJECT = 'project'
    PROJECTS = 'projects'
    DROPDOWNS = 'dropdowns'
    STATUS = 'status'
    ENGAGEMENTS = 'engagements'
    DELIVERY_MODES = 'delivery_modes'
    CLIENTS = 'clients'
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
    SKILLS = 'skills'
    RESPONSE_DATE_START = 'response_date_start'
    RESPONSE_DATE_END = 'response_date_end'
    PROJECTS = 'projects'
    SEARCH = 'search'
    PROJECT_ID = 'project_id'
    FILTER_USERS = 'filter_users'
    USER = 'user'
    POSITIONS = 'positions'
    UTILIZATION_SUM = 'utilization__sum'
    UTILIZATION = 'utilization'


class Weights:
    AVAILABILITY = 25
    SKILL = 20
    PROFICIENCY = 35
    EXPERIENCE = 20
