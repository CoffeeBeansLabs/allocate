DEFAULT_PAGE_NUMBER = 1
DEFAULT_PAGE_SIZE = 10


class PermissionKeys:
    POST = 'POST'
    GET = 'GET'
    PATCH = 'PATCH'
    PUT = 'PUT'

    USER_PERMISSIONS = {
        POST: ['user.add_role']
    }

    USER_GROUP = {
        PUT: ['auth.change_group'],
        GET: ['auth.view_group']
    }

    USER_DETAIL_PERMISSIONS = {
        POST: ['user.view_user'],
        GET: ['user.view_user'],
        PATCH: ['user.change_user']

    }

    INDUSTRY_PROFICIENCY_PERMISSION = {
        POST: ['user.change_proficiencymapping', 'user.change_industry_mapping'],
        GET: ['user.view_proficiencymapping', 'user.view_industry_mapping']
    }

    USER_FORM_RELATED_PERMISSION = {
        POST: ['edit_form.can_change_form_related_permissions']
    }

    FORM_ACCESS_PERMISSION = ['edit_form.can_access_form']

    EDIT_USER_EXPERIENCE_PERMISSION = [
        'user_experience.can_edit_user_experience']

    USER_PROFICIENCY_MAPPING_PERMISSION = ['user.add_proficiencymapping', 'user.change_proficiencymapping',
                                           'user.delete_proficiencymapping', 'user.view_proficiencymapping']
    USER_INDUSTRY_MAPPING_PERMISSION = ['user.add_industry_mapping', 'user.change_industry_mapping',
                                        'user.delete_industry_mapping', 'user.view_industry_mapping']

    USER_DETAIL_LWD_PERMISSIONS = 'user.view_last_working_day'


class ResponseKeys:
    NAME = 'name'
    USERS = 'users'
    USER = 'user'
    GROUPS = 'groups'
    COUNT = 'count'
    PROJECTS = 'projects'
    PROJECT_NAME = 'project_name'
    FULL_NAME = 'full_name'
    SKILL = 'skill'
    SKILLS = 'skills'
    UTILIZATION = 'utilization'
    EXPERIENCE_MONTHS = 'experience_months'
    CLIENT = 'client'
    TOTAL_UTILIZED = 'total_utilized'
    HAS_PERMISSION = 'has_permission'
    CAREER_BREAK_MONTHS = 'career_break_months'
    CAREER_START_DATE = 'career_start_date'
    MESSAGE = 'message'
    CITIES = 'cities'
    COUNTRIES = 'countries'


class RequestKeys:
    PAGE = 'page'
    SIZE = 'size'
    SEARCH = 'search'
    RESPONSE_DATE_START = 'response_date_start'
    RESPONSE_DATE_END = 'response_date_end'
    PROJECT = 'project'
    EXPERIENCE_RANGE_START = 'experience_range_start'
    EXPERIENCE_RANGE_END = 'experience_range_end'
    UTILIZATION = 'utilization'
    SORT_BY = 'sort_by'
    SKILLS = 'skills'
    AVAILABILITY = 'availability'
    EMAIL = 'email'
    DOB = 'dob'
    INDUSTRIES = 'industries'
    SKILLS = 'skills'
    LWD = 'lwd'
    FUNCTION = 'function'
    ROLE = 'role'
    CB_PROFILE_LINK = 'cb_profile_link'
    GA_PROFILE_LINK = 'ga_profile_link'
    STATUS = 'status'
    CAREER_BREAK_MONTHS = 'career_break_months'
    CAREER_START_DATE = 'career_start_date'
    IS_LWD_UPDATING = 'is_lwd_updating'


class SerializerKeys:
    RESPONSE_DATE_START = 'response_date_start'
    RESPONSE_DATE_END = 'response_date_end'
    REQUEST_USER = 'request_user'
    SKILLS = 'skills'
    UTILIZATION_SUM = 'utilization__sum'
    UTILIZATION = 'utilization'
    LAST_WORKING_DAY = 'last_working_day'


class StatusKeys:
    ACTIVE = 'Active'
    CLOSED = 'Closed'


class CurrentStatusKeys:
    SERVING_NP = 'Serving NP'
    FULLY_ALLOCATED = 'Fully_Allocated'
    CAFE = 'Cafe'
    MATERNITY_BREAK = 'Maternity Break'
    ADOPTION_LEAVE = 'Adoption Leave'
    SABBATICAL = 'Sabbatical'
    PATERNITY_BREAK = 'Paternity Break'


class FunctionKeys:
    DELIVERY = 'Delivery'
    SUPPORT = 'Support'


class ErrorMessages:
    EXP_START_RANGE_GREATER_THAN_EXP_END_RANGE = 'Exp start range greater than exp end range'
    YOU_DONT_HAVE_FORM_ACCESS = 'You dont have form access'
    USER_DOES_NOT_EXIST = 'User does not exist'
    INVALID_PARAMETER = "Invalid Parameter value for show management"
    INVALID_GROUP_ID = "Invalid Group ID"


class SuccessMessages:
    UPDATE_SUCCESS = "Updated Successfully"


class ValueConstants:
    MINIMUM_CAFE_UTILIZATION = 0
    MAXIMUM_CAFE_UTILIZATION = 30


class EmployeeTypeValues:
    PERMANENT = 'Permanent'
    ON_CONTRACT = 'On Contract'
    INTERN = 'Intern'


class GenderValues:
    MALE = 'Male'
    FEMALE = 'Female'


class FunctionValues:
    DELIVERY = 'Delivery'
    SUPPORT = 'Support'
