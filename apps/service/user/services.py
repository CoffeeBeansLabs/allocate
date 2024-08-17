from datetime import datetime, date, timedelta

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.db.models import Case, When, Value, CharField, BooleanField
from django.db.models import Sum, F, Q
from django.db.models.functions import Concat, Lower
from django.db.models.expressions import RawSQL
from django.utils import timezone

from authapp.constants import RoleKeys
from authapp.permissions import assign_permissions, revoke_permissions
from common.models import Skill
from helpers.exceptions import InvalidRequest
from project.constants import SerializerKeys
from project.models import ProjectAllocation
from user.constants import RequestKeys, ErrorMessages, ValueConstants
from user.filter import UserFilter, UserManagementFilter
from user.models import Role, User, ProficiencyMapping


class UserRoleService:

    def create_role(self, data):
        role = Role.objects.create(**data)
        return role


class UserService:

    def list_users(self, filters):
        """
        Method to list users.
        """
        users = User.objects.annotate(user_name=Concat(
            'first_name', Value(' '), 'last_name'))
        users = UserFilter(filters, users).qs
        return users

    def user_details(self, user_id):
        user = User.objects.filter(id=user_id).first()
        if not user:
            raise InvalidRequest(ErrorMessages.USER_DOES_NOT_EXIST)
        return user

    def skill_industry_edit(self, user_id, data):
        user = User.objects.filter(id=user_id).first()
        if not user:
            raise InvalidRequest(ErrorMessages.USER_DOES_NOT_EXIST)
        industries = data.get(RequestKeys.INDUSTRIES)
        skills = data.get(RequestKeys.SKILLS)
        user.industries.set(industries)
        ProficiencyMapping.objects.filter(user=user).update(rating=0)
        for proficiency_obj in skills:
            skill_name = proficiency_obj['skill_name']
            rating = proficiency_obj['rating']
            skill = Skill.objects.filter(name=skill_name.strip()).first()
            if not skill:
                continue
            ProficiencyMapping.objects.update_or_create(
                user=user, skill=skill, defaults={'rating': rating})
        user.skill_updated_time = timezone.now()
        user.save()
        return user

    def edit_user_experience(self, user_id, data):
        user = User.objects.filter(id=user_id).first()
        if not user:
            raise InvalidRequest(ErrorMessages.USER_DOES_NOT_EXIST)
        career_break_months = data.get(RequestKeys.CAREER_BREAK_MONTHS)
        career_start_date = data.get(RequestKeys.CAREER_START_DATE)
        user.career_break_months = career_break_months
        user.career_start_date = career_start_date
        user.save()
        return user

    def patch_proficiency(self, skills, user):
        ProficiencyMapping.objects.filter(user=user).update(rating=0)
        for proficiency_obj in skills:
            skill_name = proficiency_obj['skill_name']
            rating = proficiency_obj['rating']
            skill = Skill.objects.filter(name=skill_name.strip()).first()
            if skill:
                ProficiencyMapping.objects.update_or_create(
                    user=user, skill=skill, defaults={'rating': rating})

    def patch_user(self, user_id, data):
        user = User.objects.filter(id=user_id).first()
        if not user:
            raise InvalidRequest(ErrorMessages.USER_DOES_NOT_EXIST)
        industries = data.get(RequestKeys.INDUSTRIES)
        skills = data.get(RequestKeys.SKILLS)
        user_function = data.get(RequestKeys.FUNCTION)
        role = data.get(RequestKeys.ROLE)
        lwd = data.get(RequestKeys.LWD)
        cb_profile_link = data.get(RequestKeys.CB_PROFILE_LINK)
        ga_profile_link = data.get(RequestKeys.GA_PROFILE_LINK)
        status = data.get(RequestKeys.STATUS)

        # make the project end date as same as LWD
        if lwd:
            ProjectAllocation.objects.filter(
                user_id=user_id, end_date__gte=lwd).update(end_date=lwd)
            user.last_working_day = lwd
            update_user_status(user)

        # this logic checks that if skill key present, we have to make all the skill's rating zero
        # we write like this because there will be zero count of skills
        keys = list(data.keys())
        if RequestKeys.SKILLS in keys:
            self.patch_proficiency(skills, user)
        if cb_profile_link is not None:
            user.cb_profile_link = cb_profile_link
        if ga_profile_link is not None:
            user.ga_profile_link = ga_profile_link
        if status:
            user.current_status = status
        if user_function is not None:
            user.function = user_function
        if role:
            user.role = role
        if industries is not None:
            user.industries.set(industries)
        if user.last_working_day and user.last_working_day < datetime.today().date():
            user.status = 'Closed'
            user.is_active = False
            user.current_status = 'Closed'
        user.save()
        return user

    def remove_lwd(self, user_id):
        user = User.objects.filter(id=user_id).first()
        if not user:
            raise InvalidRequest(ErrorMessages.USER_DOES_NOT_EXIST)

        user.last_working_day = None
        update_user_status(user)
        user.save()


class UserEditPermissionService:

    def get_form_permission_map(self, content_type):
        group_permission_map = {
            RoleKeys.SUPER_ADMIN: {
                'content_type': content_type,
                'codenames': ['can_access_form']
            },
            RoleKeys.ADMIN: {
                'content_type': content_type,
                'codenames': ['can_access_form']
            },
            RoleKeys.REQUESTER: {
                'content_type': content_type,
                'codenames': ['can_access_form']
            },
            RoleKeys.VIEWER: {
                'content_type': content_type,
                'codenames': ['can_access_form']
            },
            RoleKeys.INVENTORY_MANAGER: {
                'content_type': content_type,
                'codenames': ['can_access_form']
            },
            RoleKeys.USER: {
                'content_type': content_type,
                'codenames': ['can_access_form']
            }
        }
        return group_permission_map

    def get_user_experience_permission_map(self, content_type):
        group_permission_map = {
            RoleKeys.SUPER_ADMIN: {
                'content_type': content_type,
                'codenames': ['can_edit_user_experience']
            },
            RoleKeys.ADMIN: {
                'content_type': content_type,
                'codenames': ['can_edit_user_experience']
            },
            RoleKeys.REQUESTER: {
                'content_type': content_type,
                'codenames': ['can_edit_user_experience']
            },
            RoleKeys.VIEWER: {
                'content_type': content_type,
                'codenames': ['can_edit_user_experience']
            },
            RoleKeys.INVENTORY_MANAGER: {
                'content_type': content_type,
                'codenames': ['can_edit_user_experience']
            },
            RoleKeys.USER: {
                'content_type': content_type,
                'codenames': ['can_edit_user_experience']
            }
        }
        return group_permission_map

    def get_proficiency_mapping_permission_map(self, content_type):
        group_permission_map = {
            RoleKeys.SUPER_ADMIN: {
                'content_type': content_type,
                'codenames': ['add_proficiencymapping', 'change_proficiencymapping', 'delete_proficiencymapping',
                              'view_proficiencymapping']
            },
            RoleKeys.ADMIN: {
                'content_type': content_type,
                'codenames': ['add_proficiencymapping', 'change_proficiencymapping', 'delete_proficiencymapping',
                              'view_proficiencymapping']
            },
            RoleKeys.REQUESTER: {
                'content_type': content_type,
                'codenames': ['add_proficiencymapping', 'change_proficiencymapping', 'delete_proficiencymapping',
                              'view_proficiencymapping']
            },
            RoleKeys.VIEWER: {
                'content_type': content_type,
                'codenames': ['add_proficiencymapping', 'change_proficiencymapping', 'delete_proficiencymapping',
                              'view_proficiencymapping']
            },
            RoleKeys.INVENTORY_MANAGER: {
                'content_type': content_type,
                'codenames': ['add_proficiencymapping', 'change_proficiencymapping', 'delete_proficiencymapping',
                              'view_proficiencymapping']
            },
            RoleKeys.USER: {
                'content_type': content_type,
                'codenames': ['add_proficiencymapping', 'change_proficiencymapping', 'delete_proficiencymapping',
                              'view_proficiencymapping']
            }
        }
        return group_permission_map

    def get_industry_mapping_permission_map(self, content_type):
        group_permission_map = {
            RoleKeys.SUPER_ADMIN: {
                'content_type': content_type,
                'codenames': ['add_industry_mapping', 'change_industry_mapping', 'delete_industry_mapping',
                              'view_industry_mapping']
            },
            RoleKeys.ADMIN: {
                'content_type': content_type,
                'codenames': ['add_industry_mapping', 'change_industry_mapping', 'delete_industry_mapping',
                              'view_industry_mapping']
            },
            RoleKeys.REQUESTER: {
                'content_type': content_type,
                'codenames': ['add_industry_mapping', 'change_industry_mapping', 'delete_industry_mapping',
                              'view_industry_mapping']
            },
            RoleKeys.VIEWER: {
                'content_type': content_type,
                'codenames': ['add_industry_mapping', 'change_industry_mapping', 'delete_industry_mapping',
                              'view_industry_mapping']
            },
            RoleKeys.INVENTORY_MANAGER: {
                'content_type': content_type,
                'codenames': ['add_industry_mapping', 'change_industry_mapping', 'delete_industry_mapping',
                              'view_industry_mapping']
            },
            RoleKeys.USER: {
                'content_type': content_type,
                'codenames': ['add_industry_mapping', 'change_industry_mapping', 'delete_industry_mapping',
                              'view_industry_mapping']
            }
        }
        return group_permission_map

    def assign_form_permissions(self):
        content_type = ContentType.objects.get_by_natural_key(
            app_label='edit_form', model='edit_form_permission')
        group_permission_map = self.get_form_permission_map(content_type)
        assign_permissions(group_permission_map)

    def revoke_form_permissions(self):
        content_type = ContentType.objects.get_by_natural_key(
            app_label='edit_form', model='edit_form_permission')
        group_permission_map = self.get_form_permission_map(content_type)
        revoke_permissions(group_permission_map)

    def assign_proficiency_mapping_permissions(self):
        content_type = ContentType.objects.get_by_natural_key(
            app_label='user', model='proficiencymapping')
        group_permission_map = self.get_proficiency_mapping_permission_map(
            content_type)
        assign_permissions(group_permission_map)

    def revoke_proficiency_mapping_permissions(self):
        content_type = ContentType.objects.get_by_natural_key(
            app_label='user', model='proficiencymapping')
        group_permission_map = self.get_proficiency_mapping_permission_map(
            content_type)
        revoke_permissions(group_permission_map)

    def assign_industry_mapping_permissions(self):
        content_type = ContentType.objects.get_by_natural_key(
            app_label='user', model='user')
        group_permission_map = self.get_industry_mapping_permission_map(
            content_type)
        assign_permissions(group_permission_map)

    def revoke_industry_mapping_permissions(self):
        content_type = ContentType.objects.get_by_natural_key(
            app_label='user', model='user')
        group_permission_map = self.get_industry_mapping_permission_map(
            content_type)
        revoke_permissions(group_permission_map)

    def assign_edit_user_experience_permissions(self):
        content_type = ContentType.objects.get_by_natural_key(app_label='user_experience',
                                                              model='edit_user_experience_permission')
        group_permission_map = self.get_user_experience_permission_map(
            content_type)
        assign_permissions(group_permission_map)

    def revoke_edit_user_experience_permissions(self):
        content_type = ContentType.objects.get_by_natural_key(app_label='user_experience',
                                                              model='edit_user_experience_permission')
        group_permission_map = self.get_user_experience_permission_map(
            content_type)
        revoke_permissions(group_permission_map)

    def has_group_permission(self):
        group = Group.objects.get(name='user')
        permission = Permission.objects.get(codename='can_access_form')
        has_permission = permission in group.permissions.all()
        return has_permission

    def has_skill_group_permission(self):
        group = Group.objects.get(name='user')
        permission = Permission.objects.get(
            codename='change_proficiencymapping')
        has_permission = permission in group.permissions.all()
        return has_permission

    def has_industry_group_permission(self):
        group = Group.objects.get(name='user')
        permission = Permission.objects.get(codename='change_industry_mapping')
        has_permission = permission in group.permissions.all()
        return has_permission

    def has_user_experience_group_permission(self):
        group = Group.objects.get(name='user')
        permission = Permission.objects.get(
            codename='can_edit_user_experience')
        has_permission = permission in group.permissions.all()
        return has_permission


def update_user_status(user, utilization=0):
    allocations = ProjectAllocation.objects.filter(user=user,
                                                   start_date__lte=datetime.today().date(),
                                                   end_date__gte=datetime.today().date())

    total_utilization = allocations.aggregate(Sum(SerializerKeys.UTILIZATION))[
        SerializerKeys.UTILIZATION_SUM]

    if not total_utilization:
        total_utilization = 0

    total_utilization = total_utilization - utilization
    current_status = user.current_status

    if user.last_working_day is not None:
        current_status = 'Serving NP'

    elif user.status == 'Active' and user.current_status != 'Closed':
        if total_utilization >= ValueConstants.MAXIMUM_CAFE_UTILIZATION:
            current_status = 'Fully_Allocated'

        elif ValueConstants.MAXIMUM_CAFE_UTILIZATION > total_utilization >= ValueConstants.MINIMUM_CAFE_UTILIZATION:
            current_status = 'Cafe'

    user.current_status = current_status
    user.save()


def list_cafe_users(start_date=None, end_date=None):
    current_date = date.today()
    for_period_start_date = current_date
    for_period_end_date = current_date + timedelta(days=30)

    if start_date is not None:
        for_period_start_date = start_date
    if end_date is not None:
        for_period_end_date = end_date

    query = """
        with
        day_wise_allocation as (
            select
                user_id,
                generate_series(start_date, coalesce(end_date, date %s), '1 day')::date as day,
                sum(utilization) as util
            from project_allocation
            group by user_id, day
        ),
        project_based_availability as (
            select
                u.id as uid,
                s.day as day,
                coalesce(a.util, 0) < %s as is_cafe
            from users u
                left join (select id, generate_series(date %s, date %s, '1 day')::date as day from users) as s on
                u.id=s.id
                left join day_wise_allocation a on u.id=a.user_id and s.day=a.day
        )
        select exists(select pba.uid from project_based_availability pba
        where pba.uid=users.id and pba.is_cafe = true
        group by pba.uid) as is_potential_cafe
    """
    users = User.objects.annotate(is_potential_cafe=RawSQL(query, params=[for_period_end_date,
                                                                          ValueConstants.MAXIMUM_CAFE_UTILIZATION,
                                                                          for_period_start_date, for_period_end_date],
                                                           output_field=BooleanField())) \
        .filter(is_potential_cafe=True, status='Active')

    return users


class UserManagementService:

    def list_management_users(self, filters):
        show_management = filters['show_management']
        if show_management:
            group_names = Group.objects.exclude(
                name=RoleKeys.USER).values_list('name', flat=True)
        else:
            group_names = [RoleKeys.USER]

        users = User.objects.all()
        users = users.filter(status='Active', groups__name__in=group_names)
        users = users.annotate(
            user_name=Concat('first_name', Value(' '), 'last_name'),
            group_name=F('groups__name'),
            group_id=F('groups__id'),
            custom_order=Case(
                When(group_name=RoleKeys.SUPER_ADMIN, then=Value(0)),
                default=Value(1),
                output_field=CharField()
            )
        ).values('id', 'user_name', 'employee_id', 'group_name', 'group_id', 'custom_order')

        users = users.order_by('custom_order', 'user_name')
        users = UserManagementFilter(filters, users).qs
        return users

    @transaction.atomic
    def update_group(self, data):
        user = User.objects.filter(id=data['user_id']).first()
        if not user:
            raise InvalidRequest(ErrorMessages.USER_DOES_NOT_EXIST)
        if not Group.objects.filter(id=data['group_id']).exists():
            raise InvalidRequest(ErrorMessages.INVALID_GROUP_ID)
        user.groups.clear()
        user.groups.add(data['group_id'])

    @transaction.atomic
    def update_user_group(self, items):
        for item in items:
            self.update_group(item)


class GroupService:
    def list_groups(self):
        groups = Group.objects.all()
        return groups


class LocationService:
    def list_cities(self, data):
        countries = data.get("countries")

        if countries and len(countries) != 0:
            country_queries = Q()
            for country in countries:
                country_queries |= Q(country__iexact=country)

            cities = (
                User.objects.filter(country_queries)
                .exclude(work_location='')
                .annotate(work_location_lower=Lower("work_location"))
                .values_list("work_location_lower", flat=True)
                .distinct()
            )
            return cities

        cities = (
            User.objects.annotate(work_location_lower=Lower("work_location"))
            .values_list("work_location_lower", flat=True)
            .distinct()
        )
        cities = [city for city in cities if city]
        return cities

    def list_countries(self):
        countries = User.objects.exclude(country='').values_list(
            "country", flat=True).distinct()
        return countries
