class PermissionKeys:
    POST = 'POST'
    GET = 'GET'

    DASHBOARD_PERMISSIONS = {
        POST: ['user.view_user'],
        GET: ['user.view_user']
    }

    USER_LWD_PERMISSIONS = {
        GET: ['user.view_user', 'user.view_last_working_day']
    }


class RequestKeys:
    # query params for all pages on dashboard

    # dashboard page
    SKILLS_SORT_ASCENDING = "skills_sort_ascending"
    OPEN_POSITIONS_SORT_ASCENDING = "open_positions_sort_ascending"

    # current allocation page
    PROJECT_ALLOCATION_SORT_ASCENDING = "project_allocation_sort_ascending"
    ROLE_BREAKUP_SORT_ASCENDING = "role_breakup_sort_ascending"
    OVERALL_SKILLS_SORT_ASCENDING = "overall_skills_sort_ascending"

    # cafe and potential page
    CAFE_SORT_ASCENDING = "cafe_sort_ascending"
    POTENTIAL_CAFE_SORT_ASCENDING = "potential_cafe_sort_ascending"

    # people page
    PROFICIENCY_SORT_ASCENDING = "proficiency_sort_ascending"
    EXPERIENCE_SORT_ASCENDING = "experience_sort_ascending"

    # "people" page AND "client and projects" page
    INDUSTRIES_SORT_ASCENDING = "industries_sort_ascending"

    # "client and projects" page
    ALLOCATION_SORT_ASCENDING = "allocation_sort_ascending"
    PROJECT_ID = "project_id"
    ROLE_ID = "role_id"


class ResponseKeys:
    DATA = 'data'
    CAFE_EMPLOYEE_SKILLS = 'cafe_employee_skills'
    EMPLOYEE_DATA = 'employee_data'
    EMPLOYEE_SKILLS = 'employee_skills'
    PROJECT_ALLOCATION = 'project_allocation'
    POTENTIAL_CAFE_EMPLOYEE_SKILLS = 'potential_cafe_employee_skills'
    OVERALL_EMPLOYEE_SKILLS = 'overall_employee_skills'
    INDUSTRY_COUNT = 'industry_count'
    OPEN_POSITIONS = 'open_positions'
    ROLE_BREAKUP = 'role_breakup'
    CLIENTS = 'clients'
    EMPLOYEE_ANNIVERSARY = 'employee_anniversary'
    INDUSTRY_EXPERIENCE_EMPLOYEE = 'industry_experience_employee'
    OVERALL_EMPLOYEE_SKILLS_EXPERIENCE = 'overall_employee_skills_experience'
    EMPLOYEE_LAST_WORKING_DAY = 'employee_last_working_day'


class ServiceKeys:
    CAFE = 'cafe'
    POTENTIAL_CAFE = 'potential_cafe'


class SerializerKeys:
    PROJECT_ID = "project_id"
    ROLE_ID = "role_id"


class ErrorMessages:
    EITHER_PROJECT_OR_ROLE_IS_REQUIRED = 'Either project_id or role_id is required'
