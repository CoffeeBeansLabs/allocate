import datetime
from collections import OrderedDict

from django.db.models import Q, Count, Value, F, Sum, Subquery, OuterRef
from django.db.models.functions import Concat, Coalesce
from rest_framework import serializers

from client.models import Client
from common.models import Industry
from dashboard.constant import ErrorMessages, RequestKeys, SerializerKeys
from project.models import ProjectAllocation, ProjectRole, ProjectPosition
from user.constants import StatusKeys, FunctionKeys, CurrentStatusKeys, EmployeeTypeValues, GenderValues, \
    FunctionValues, ValueConstants
from user.models import User, ProficiencyMapping
from user.services import list_cafe_users
from utils.utils import camel_to_snake


def validate_project_role(attrs):
    project_id = attrs.get(RequestKeys.PROJECT_ID)
    role_id = attrs.get(RequestKeys.ROLE_ID)

    if (not project_id and not role_id) or (project_id and role_id):
        raise serializers.ValidationError(
            ErrorMessages.EITHER_PROJECT_OR_ROLE_IS_REQUIRED)


class DashboardEmployeesDetailsRequestSerializer(serializers.Serializer):
    skills_sort_ascending = serializers.BooleanField(default=True)
    open_positions_sort_ascending = serializers.BooleanField(default=True)
    project_id = serializers.IntegerField(required=False)
    role_id = serializers.IntegerField(required=False)

    def validate(self, attrs):
        validate_project_role(attrs)
        return attrs

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class DashboardEmployeesDetailsResponseSerializer(serializers.ModelSerializer):
    total_people_count = serializers.SerializerMethodField()
    employees_count = serializers.SerializerMethodField()
    contractor_count = serializers.SerializerMethodField()
    intern_count = serializers.SerializerMethodField()
    female_count = serializers.SerializerMethodField()
    male_count = serializers.SerializerMethodField()
    support_people = serializers.SerializerMethodField()
    delivery_people = serializers.SerializerMethodField()
    allocated_people = serializers.SerializerMethodField()
    cafe_people = serializers.SerializerMethodField()
    potential_cafe_people = serializers.SerializerMethodField()
    changes_in_total_people = serializers.SerializerMethodField()
    changes_in_employees_count = serializers.SerializerMethodField()
    changes_in_contractor_count = serializers.SerializerMethodField()
    changes_in_intern_count = serializers.SerializerMethodField()
    changes_in_allocated_people = serializers.SerializerMethodField()
    changes_in_cafe_people = serializers.SerializerMethodField()
    changes_in_potential_cafe_people = serializers.SerializerMethodField()

    def get_total_people_count(self, instance):
        value = len(instance.filter())
        return value

    def get_employees_count(self, instance):
        return len(instance.filter(employee_type=EmployeeTypeValues.PERMANENT))

    def get_contractor_count(self, instance):
        return len(instance.filter(employee_type=EmployeeTypeValues.ON_CONTRACT))

    def get_intern_count(self, instance):
        return len(instance.filter(employee_type=EmployeeTypeValues.INTERN))

    def get_male_count(self, instance):
        return len(instance.filter(gender=GenderValues.MALE))

    def get_female_count(self, instance):
        return len(instance.filter(gender=GenderValues.FEMALE))

    def get_support_people(self, instance):
        return len(instance.filter(function=FunctionValues.SUPPORT))

    def get_delivery_people(self, instance):
        return len(instance.filter(function=FunctionValues.DELIVERY))

    def get_allocated_people(self, instance):
        current_date = datetime.date.today()
        billable_user_ids = ProjectAllocation.objects.filter(position__is_billable=True,
                                                             start_date__lte=current_date,
                                                             end_date__gte=current_date) \
            .values('user_id')
        included_status = [CurrentStatusKeys.FULLY_ALLOCATED,
                           CurrentStatusKeys.SERVING_NP, CurrentStatusKeys.CAFE]
        users = instance.filter(id__in=billable_user_ids, current_status__in=included_status, status=StatusKeys.ACTIVE,
                                function=FunctionKeys.DELIVERY).count()
        return users

    def get_cafe_people(self, instance):
        return instance.filter(current_status=CurrentStatusKeys.CAFE).count()

    def get_potential_cafe_people(self, instance):
        users = list_cafe_users().values('id')
        return instance.filter(id__in=users, current_status=CurrentStatusKeys.FULLY_ALLOCATED).count()

    def get_changes_in_total_people(self, instance):
        current_date = datetime.date.today()
        last_day_of_last_month = current_date.replace(
            day=1) - datetime.timedelta(days=1)
        last_month_count = len(
            instance.filter(Q(date_of_joining__lte=last_day_of_last_month)))
        total_count = len(instance.filter())

        if last_month_count == 0:
            return 0

        return ((total_count - last_month_count) / last_month_count) * 100

    def get_changes_in_employees_count(self, instance):
        current_date = datetime.date.today()
        last_day_of_last_month = current_date.replace(
            day=1) - datetime.timedelta(days=1)
        last_month_count = len(instance.filter(Q(employee_type=EmployeeTypeValues.PERMANENT),
                                               Q(date_of_joining__lte=last_day_of_last_month)))
        total_count = len(instance.filter(
            Q(employee_type=EmployeeTypeValues.PERMANENT)))

        if last_month_count == 0:
            return 0

        return ((total_count - last_month_count) / last_month_count) * 100

    def get_changes_in_contractor_count(self, instance):
        current_date = datetime.date.today()
        last_day_of_last_month = current_date.replace(
            day=1) - datetime.timedelta(days=1)
        last_month_count = len(instance.filter(Q(employee_type=EmployeeTypeValues.ON_CONTRACT),
                                               Q(date_of_joining__lte=last_day_of_last_month)))
        total_count = len(instance.filter(
            Q(employee_type=EmployeeTypeValues.ON_CONTRACT)))

        if last_month_count == 0:
            return 0
        return ((total_count - last_month_count) / last_month_count) * 100

    def get_changes_in_intern_count(self, instance):
        current_date = datetime.date.today()
        last_day_of_last_month = current_date.replace(
            day=1) - datetime.timedelta(days=1)
        last_month_count = len(instance.filter(Q(employee_type=EmployeeTypeValues.INTERN),
                                               Q(date_of_joining__lte=last_day_of_last_month)))
        total_count = len(instance.filter(
            Q(employee_type=EmployeeTypeValues.INTERN)))

        if last_month_count == 0:
            return 0
        return ((total_count - last_month_count) / last_month_count) * 100

    def get_changes_in_allocated_people(self, instance):
        current_date = datetime.date.today()
        last_day_of_last_month = current_date.replace(
            day=1) - datetime.timedelta(days=1)
        total_allocated_users = ProjectAllocation.objects.filter(user__in=instance, position__is_billable=True,
                                                                 start_date__lte=current_date,
                                                                 end_date__gte=current_date).values(
                                                                     'user_id').distinct().count()
        last_month_count = ProjectAllocation.objects.filter(user__in=instance, position__is_billable=True,
                                                            start_date__lte=last_day_of_last_month,
                                                            end_date__gte=last_day_of_last_month).values(
                                                                'user_id').distinct().count()

        if last_month_count == 0:
            return 0

        return ((total_allocated_users - last_month_count) / last_month_count) * 100

    def get_changes_in_cafe_people(self, instance):
        current_date = datetime.date.today()
        last_day_of_last_month = current_date.replace(
            day=1) - datetime.timedelta(days=1)
        total_cafe_people = instance.filter(current_status='Cafe').count()
        last_month_cafe_users = list_cafe_users(
            start_date=last_day_of_last_month, end_date=last_day_of_last_month).values('id')
        last_month_cafe_count = instance.filter(
            id__in=last_month_cafe_users).count()

        if last_month_cafe_count == 0:
            return 0

        return ((total_cafe_people - last_month_cafe_count) / last_month_cafe_count) * 100

    def get_changes_in_potential_cafe_people(self, instance):
        current_date = datetime.date.today()
        last_day_of_last_month = current_date.replace(
            day=1) - datetime.timedelta(days=1)
        current_potential_cafe_users = list_cafe_users().values('id')
        current_potential_cafe_count = instance.filter(
            id__in=current_potential_cafe_users, current_status=CurrentStatusKeys.FULLY_ALLOCATED).count()

        subquery = Subquery(
            ProjectAllocation.objects.filter(
                user_id=OuterRef('id'),
                start_date__lte=last_day_of_last_month,
                end_date__gte=last_day_of_last_month
            ).values('user_id').annotate(
                total_utilization=Coalesce(Sum('utilization'), Value(0))
            ).values('total_utilization'))

        previous_potential_cafe_users = list_cafe_users(
            start_date=last_day_of_last_month, end_date=last_day_of_last_month + datetime.timedelta(
                days=30)).annotate(
            total_utilization=subquery).filter(total_utilization__gte=ValueConstants.MAXIMUM_CAFE_UTILIZATION)

        previous_potential_cafe_count = instance.filter(
            id__in=previous_potential_cafe_users).count()

        if previous_potential_cafe_count == 0:
            return 0

        return ((current_potential_cafe_count - previous_potential_cafe_count) / previous_potential_cafe_count) * 100

    class Meta:
        model = User
        fields = ('total_people_count', 'changes_in_total_people', 'employees_count', 'changes_in_employees_count',
                  'contractor_count', 'changes_in_contractor_count', 'intern_count', 'changes_in_intern_count',
                  'male_count', 'female_count',
                  'support_people', 'delivery_people', 'allocated_people', 'changes_in_allocated_people', 'cafe_people',
                  'changes_in_cafe_people', 'potential_cafe_people', 'changes_in_potential_cafe_people')


class DashboardCurrentAllocationRequestSerializer(serializers.Serializer):
    project_allocation_sort_ascending = serializers.BooleanField(default=True)
    role_breakup_sort_ascending = serializers.BooleanField(default=True)
    overall_skills_sort_ascending = serializers.BooleanField(default=True)
    project_id = serializers.IntegerField(required=False)
    role_id = serializers.IntegerField(required=False)

    def validate(self, attrs):
        validate_project_role(attrs)
        return attrs

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class DashboardCafeAndPotentialRequestSerializer(serializers.Serializer):
    cafe_sort_ascending = serializers.BooleanField(default=True)
    potential_cafe_sort_ascending = serializers.BooleanField(default=True)

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class DashboardPeopleRequestSerializer(serializers.Serializer):
    proficiency_sort_ascending = serializers.BooleanField(default=True)
    experience_sort_ascending = serializers.BooleanField(default=True)
    industries_sort_ascending = serializers.BooleanField(default=True)

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class DashboardClientAndProjectsRequestSerializer(serializers.Serializer):
    industries_sort_ascending = serializers.BooleanField(default=True)
    allocation_sort_ascending = serializers.BooleanField(default=True)

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class DashboardEmployeesSkillDetailsResponseSerializer(serializers.ModelSerializer):
    employee_skill_count = serializers.SerializerMethodField()

    def get_employee_skill_count(self, instance):
        output = {}
        for row in instance:
            skill_name = row["skill__name"]
            rating = row["rating"]
            count = row["count"]

            if skill_name not in output:
                output[skill_name] = {}

            output[skill_name][rating] = count

        return output

    class Meta:
        model = ProficiencyMapping
        fields = ('employee_skill_count',)


class DashboardEmployeesSkillExperienceDetailsResponseSerializer(serializers.ModelSerializer):
    employee_skill_experience = serializers.SerializerMethodField()

    def get_employee_skill_experience(self, instance):
        output = {}
        for row in instance:
            skill_name = row["skill_name"]
            experience_range = row["experience_range"]
            count = row["count"]

            if skill_name not in output:
                output[skill_name] = {}

            output[skill_name][experience_range] = count

        return output

    class Meta:
        model = ProficiencyMapping
        fields = ('employee_skill_experience',)


class DashboardOpenPositionsProjectRoleResponseSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    positions = serializers.SerializerMethodField()

    def get_name(self, instance):
        role_id = self.context.get(SerializerKeys.ROLE_ID)
        project_id = self.context.get(SerializerKeys.PROJECT_ID)
        name = ""
        if role_id is not None:
            name = instance.project.name
        if project_id is not None:
            name = instance.role.name
        return name

    def get_positions(self, instance):
        project_positions = ProjectPosition.objects.filter(id__in=instance.open_positions).values(
            'experience_range_start', 'experience_range_end').annotate(
            position_count=Count('id')).order_by('position_count')
        return DashboardOpenPositionsProjectPositionResponseSerializer(project_positions, many=True).data

    class Meta:
        model = ProjectRole
        fields = ('name', 'positions')


class DashboardOpenPositionsProjectPositionResponseSerializer(serializers.ModelSerializer):
    position_count = serializers.SerializerMethodField()

    def get_position_count(self, instance):
        return instance['position_count']

    class Meta:
        model = ProjectPosition
        fields = ('experience_range_start',
                  'experience_range_end', 'position_count')


class DashboardProjectAllocationProjectRoleResponseSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    allocations = serializers.SerializerMethodField()

    def get_name(self, instance):
        role_id = self.context.get(SerializerKeys.ROLE_ID)
        project_id = self.context.get(SerializerKeys.PROJECT_ID)
        name = ""
        if role_id is not None:
            name = instance.project.name
        if project_id is not None:
            name = instance.role.name
        return name

    def get_allocations(self, instance):
        project_allocations = ProjectAllocation.objects.filter(id__in=instance.current_allocations).values(
            'position__experience_range_start', 'position__experience_range_end').annotate(
            allocation_count=Count('id')).order_by('allocation_count')
        return DashboardProjectAllocationResponseSerializer(project_allocations, many=True).data

    class Meta:
        model = ProjectRole
        fields = ('name', 'allocations')


class DashboardProjectAllocationResponseSerializer(serializers.ModelSerializer):
    experience_range_start = serializers.CharField(
        source='position__experience_range_start')
    experience_range_end = serializers.CharField(
        source='position__experience_range_end')
    position_count = serializers.SerializerMethodField()

    def get_position_count(self, instance):
        return instance['allocation_count']

    class Meta:
        model = ProjectAllocation
        fields = ('experience_range_start',
                  'experience_range_end', 'position_count')


class DashboardEmployeesIndustriesResponseSerializer(serializers.ModelSerializer):
    industry_experience_employee = serializers.SerializerMethodField()

    def get_industry_experience_employee(self, instance):
        return instance.annotate(industry=F('name'), employeeCount=Count('user')).values('industry', 'employeeCount')

    class Meta:
        model = Industry
        fields = ('industry_experience_employee',)


class DashboardEmployeesDataResponseSerializer(serializers.ModelSerializer):
    employee_location_count = serializers.SerializerMethodField()
    anniversary_employee = serializers.SerializerMethodField()
    last_working_day_employee = serializers.SerializerMethodField()

    def get_employee_location_count(self, instance):
        total_location_count = instance.filter(Q(status='Active')) \
            .values('location').annotate(location_count=Count('location'))

        return total_location_count

    def get_anniversary_employee(self, instance):
        current_month = datetime.datetime.now().month
        employees = instance.filter(Q(date_of_joining__month=current_month), Q(status='Active')) \
            .annotate(full_name=Concat('first_name', Value(' '), 'last_name')) \
            .values('full_name', 'date_of_joining')

        return employees

    def get_last_working_day_employee(self, instance):
        current_month = datetime.datetime.now().month
        employees = instance.filter(Q(last_working_day__month=current_month), Q(status='Active')) \
            .annotate(full_name=Concat('first_name', Value(' '), 'last_name')) \
            .values('full_name', 'last_working_day', 'role__name', 'id')

        return employees

    class Meta:
        model = User
        fields = ('employee_location_count', 'anniversary_employee',
                  'last_working_day_employee')


class DashboardRetrieveClientAllocationSerializer(serializers.ModelSerializer):
    allocated_users = serializers.SerializerMethodField()

    def get_allocated_users(self, instance):
        return instance.allocation_count

    class Meta:
        model = Client
        fields = ('name', 'allocated_users')


class DashboardRetrieveIndustryCountSerializer(serializers.ModelSerializer):
    client_count = serializers.SerializerMethodField()

    def get_client_count(self, instance):
        return instance.clients.count()

    class Meta:
        model = Industry
        fields = ('name', 'client_count')


def dashboard_role_name_experience_bucket_serializer(instance):
    new_dict = OrderedDict()
    for i in instance:
        role_name = i['role_name']
        # temporary 'if' branch - needs to be removed when a name is decided for these roles
        if role_name is None:
            role_name = 'null'

        if new_dict.get(role_name):
            new_dict[role_name].update({i['experience_range']: i['count']})
        else:
            new_dict[role_name] = {i['experience_range']: i['count']}

    return new_dict
