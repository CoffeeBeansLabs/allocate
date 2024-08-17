import datetime
from itertools import chain

from rest_framework import serializers
from django.db.models import Q, Sum, Value, IntegerField
from django.db.models.functions import Coalesce

from common.models import Skill, Industry
from common.serializers import IndustrySerializer
from project.models import ProjectAllocation, ProjectAllocationRequest, Project
from user.constants import DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, PermissionKeys, SerializerKeys
from user.models import User, Role, ProficiencyMapping, LeavePlans
from utils.utils import camel_to_snake


class UserSerializer(serializers.ModelSerializer):
    picture = serializers.CharField(required=False)
    has_proficiency_mapping_permission = serializers.SerializerMethodField()
    has_industry_mapping_permission = serializers.SerializerMethodField()
    has_form_access = serializers.SerializerMethodField()
    has_user_experience_permissions = serializers.SerializerMethodField()

    def get_has_form_access(self, instance):
        return instance.has_perm(PermissionKeys.FORM_ACCESS_PERMISSION[0])

    def get_has_proficiency_mapping_permission(self, instance):
        return instance.has_perm(PermissionKeys.USER_PROFICIENCY_MAPPING_PERMISSION[0])

    def get_has_industry_mapping_permission(self, instance):
        return instance.has_perm(PermissionKeys.USER_INDUSTRY_MAPPING_PERMISSION[0])

    def get_has_user_experience_permissions(self, instance):
        return instance.has_perm(PermissionKeys.EDIT_USER_EXPERIENCE_PERMISSION[0])

    class Meta:
        model = User
        fields = ('id', 'employee_id', 'email', 'first_name', 'last_name', 'roles', 'picture', 'has_form_access',
                  'has_proficiency_mapping_permission', 'has_industry_mapping_permission',
                  'has_user_experience_permissions')


class AccountManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'full_name_with_exp_band')


class SenderSerializer(AccountManagerSerializer):
    pass


class ReceiverSerializer(AccountManagerSerializer):
    pass


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ('id', 'name')


class ProficiencySerializer(serializers.ModelSerializer):
    skill = serializers.CharField(source='skill.name')

    class Meta:
        model = ProficiencyMapping
        fields = ('skill', 'rating')


class UserProficiencySerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField()

    class Meta:
        model = ProficiencyMapping
        fields = ('skill_name', 'rating')


class LeavesSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeavePlans
        fields = ('from_date', 'to_date')


class RoleRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ('name',)


class UsersProjectSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='position.project_role.project.name')
    is_same_project = serializers.SerializerMethodField()

    def get_is_same_project(self, instance):
        projects = self.context.get('projects')
        if projects:
            return instance.position.project_role.project in projects
        return False

    class Meta:
        model = ProjectAllocation
        fields = ('id', 'project_name', 'is_same_project', 'utilization', 'kt_period', 'start_date', 'end_date')


class TalentAllocationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectAllocationRequest
        fields = ('id', 'utilization', 'kt_period', 'start_date', 'end_date')


class TalentAllocationResponseSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="position.project_role.project.name")

    class Meta:
        model = ProjectAllocationRequest
        fields = ('id', 'project_name', 'utilization', 'kt_period', 'start_date', 'end_date')


class ListUserRequestSerializer(serializers.Serializer):
    search = serializers.CharField(required=False, allow_null=True)
    status = serializers.ListField(child=serializers.CharField(), required=False)
    sort_by = serializers.CharField(required=False, allow_null=False)
    page = serializers.IntegerField(default=DEFAULT_PAGE_NUMBER)
    size = serializers.IntegerField(default=DEFAULT_PAGE_SIZE)
    experience_range_start = serializers.IntegerField(allow_null=True, required=False)
    experience_range_end = serializers.IntegerField(allow_null=True, required=False)
    response_date_start = serializers.DateField(required=False, allow_null=True)
    response_date_end = serializers.DateField(required=False, allow_null=True)
    availability = serializers.IntegerField(allow_null=True, required=False)
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), many=True, required=False,
                                                 allow_null=True)
    skills = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all(), many=True, required=False,
                                                allow_null=True)
    function = serializers.CharField(required=False, allow_null=True)
    locations = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        allow_null=True
    )

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class ListUserResponseSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()
    role = RoleSerializer()
    projects = serializers.SerializerMethodField()
    leave_plans = serializers.SerializerMethodField()
    is_over_utilized = serializers.SerializerMethodField()
    requests = serializers.SerializerMethodField()
    total_utilized = serializers.SerializerMethodField()

    def get_skills(self, instance):
        skills = self.context.get(SerializerKeys.SKILLS)
        proficiency_mapping = ProficiencyMapping.objects.filter(user=instance).order_by('-rating').exclude(rating=0)
        if skills:
            proficiency_mapping = ProficiencyMapping.objects.filter(user=instance, skill__in=skills).order_by(
                '-rating').exclude(rating=0)
            proficiency_mapping = chain(proficiency_mapping,
                                        ProficiencyMapping.objects.filter(user=instance).order_by('-rating')
                                        .exclude(Q(skill__in=skills) | Q(rating=0)))
        return ProficiencySerializer(proficiency_mapping, many=True).data

    def get_projects(self, instance):
        response_date_start = self.context.get(SerializerKeys.RESPONSE_DATE_START)
        response_date_end = self.context.get(SerializerKeys.RESPONSE_DATE_END)
        projects = self.context.get('projects')

        allocations = ProjectAllocation.objects.filter(user=instance)
        if response_date_start:
            allocations = allocations.filter(Q(end_date__gte=response_date_start) | Q(end_date__isnull=True))
        if response_date_end:
            allocations = allocations.filter(start_date__lte=response_date_end)

        return UsersProjectSerializer(allocations, many=True, context={'projects': projects}).data

    def get_requests(self, instance):
        project_allocation_request = ProjectAllocationRequest.objects.filter(
            Q(status=ProjectAllocationRequest.Status.PENDING),
            Q(user=instance))
        return TalentAllocationResponseSerializer(project_allocation_request, many=True).data

    def get_leave_plans(self, instance):
        response_date_start = self.context.get(SerializerKeys.RESPONSE_DATE_START)
        response_date_end = self.context.get(SerializerKeys.RESPONSE_DATE_END)

        leaves = LeavePlans.objects.filter(user=instance, approval_status='Approved')
        if response_date_start:
            leaves = leaves.filter(to_date__gte=response_date_start)
        if response_date_end:
            leaves = leaves.filter(from_date__lte=response_date_end)

        return LeavesSerializer(leaves, many=True).data

    def get_is_over_utilized(self, instance):
        response_date_start = self.context.get(SerializerKeys.RESPONSE_DATE_START)
        response_date_end = self.context.get(SerializerKeys.RESPONSE_DATE_END)

        allocations = ProjectAllocation.objects.filter(user=instance,
                                                       start_date__lte=datetime.date.today(),
                                                       end_date__gte=datetime.date.today())
        if response_date_start:
            allocations = allocations.filter(Q(end_date__gte=response_date_start) | Q(end_date__isnull=True))
        if response_date_end:
            allocations = allocations.filter(start_date__lte=response_date_end)
        utilization = allocations.aggregate(Sum(SerializerKeys.UTILIZATION))[SerializerKeys.UTILIZATION_SUM]
        if utilization:
            return utilization > 100
        return False

    def get_total_utilized(self, instance):
        allocations = ProjectAllocation.objects.filter(Q(user=instance),
                                                       Q(start_date__lte=datetime.date.today()),
                                                       (Q(end_date__gte=datetime.date.today()) | Q(end_date=None)))
        utilization = allocations.aggregate(Sum(SerializerKeys.UTILIZATION))[SerializerKeys.UTILIZATION_SUM]
        return utilization if utilization else 0

    class Meta:
        model = User
        fields = (
            'id', 'employee_id', 'full_name_with_exp_band', 'current_status', 'role', 'is_over_utilized',
            'total_utilized',
            'experience_months', 'last_working_day', 'function', 'skills', 'leave_plans', 'projects', 'requests',
            'work_location')


class UserDetailsProjectSerializer(serializers.ModelSerializer):
    project_id = serializers.CharField(source='position.project_role.project.id')
    project_name = serializers.CharField(source='position.project_role.project.name')
    role = serializers.CharField(source='position.project_role.role.name')
    client = serializers.SerializerMethodField()

    def get_client(self, instance):
        from client.serializers import ProjectClientSerializer
        return ProjectClientSerializer(instance.position.project_role.project.client).data

    class Meta:
        model = ProjectAllocation
        fields = ('id', 'project_id', 'project_name', 'start_date', 'end_date', 'client', 'role')


class UserDetailsResponseSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()
    current_projects = serializers.SerializerMethodField()
    role = RoleSerializer()
    reporting_to = UserSerializer()
    past_projects = serializers.SerializerMethodField()
    total_utilized = serializers.SerializerMethodField()
    industries = IndustrySerializer(many=True)

    def to_representation(self, instance):
        request_user = self.context.get(SerializerKeys.REQUEST_USER)
        representation = super().to_representation(instance)

        if not request_user.has_perm(PermissionKeys.USER_DETAIL_LWD_PERMISSIONS):
            representation.pop(SerializerKeys.LAST_WORKING_DAY)

        return representation

    def get_skills(self, instance):
        proficiency_mapping = ProficiencyMapping.objects.filter(user=instance).order_by('-rating').exclude(rating=0)
        return ProficiencySerializer(proficiency_mapping, many=True).data

    def get_current_projects(self, instance):
        allocations = ProjectAllocation.objects.filter(Q(user=instance),
                                                       (Q(end_date__gte=datetime.date.today()) | Q(
                                                           end_date__isnull=True)))

        return UserDetailsProjectSerializer(allocations, many=True).data

    def get_past_projects(self, instance):
        allocations = ProjectAllocation.objects.filter(Q(user=instance),
                                                       Q(end_date__lt=datetime.date.today()))

        return UserDetailsProjectSerializer(allocations, many=True).data

    def get_total_utilized(self, instance):
        allocations = ProjectAllocation.objects.filter(user=instance,
                                                       start_date__lte=datetime.date.today(),
                                                       end_date__gte=datetime.date.today())
        utilization = allocations.aggregate(Sum(SerializerKeys.UTILIZATION))[SerializerKeys.UTILIZATION_SUM]
        return utilization

    class Meta:
        model = User
        fields = ('career_start_date', 'career_break_months', 'id', 'industries',
                  'employee_id', 'date_of_joining', 'phone_number', 'gender', 'email', 'full_name_with_exp_band',
                  'current_status',
                  'function', 'country',
                  'work_location', 'role', 'reporting_to', 'cb_profile_link', 'ga_profile_link', 'experience_months',
                  'company_experience_months',
                  'total_utilized', 'employee_type', 'last_working_day', 'skills', 'current_projects', 'past_projects')


class UserSkillIndustryResponseSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()

    def get_skills(self, instance):
        proficiency_mappings = ProficiencyMapping.objects.filter(user=instance).select_related('skill')

        skill_ratings = proficiency_mappings.annotate(
            skill_name=Coalesce('skill__name', Value('')),
        ).values('skill_name').annotate(rating=Coalesce(Sum('rating'), Value(0)))

        skills_not_have = Skill.objects.exclude(
            Q(proficiency_mapping__user=instance)
        ).annotate(
            skill_name=Coalesce('name', Value('')),
            rating=Value(0, output_field=IntegerField())
        ).values('skill_name', 'rating')

        all_skills = skill_ratings.union(skills_not_have).order_by('skill_name')

        return UserProficiencySerializer(list(all_skills), many=True).data

    class Meta:
        model = User
        fields = ('industries', 'skills')


class UserSkillIndustryRequestSerializer(serializers.Serializer):
    skills = UserProficiencySerializer(many=True)
    industries = serializers.PrimaryKeyRelatedField(queryset=Industry.objects.all(), many=True)


class EditUserExperienceRequestSerializer(serializers.Serializer):
    career_start_date = serializers.DateField(allow_null=True)
    career_break_months = serializers.IntegerField(default=0)


class EditUserExperienceResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('career_start_date', 'career_break_months')


class EditUserRequestSerializer(serializers.Serializer):
    skills = UserProficiencySerializer(many=True, required=False, allow_null=True)
    industries = serializers.PrimaryKeyRelatedField(queryset=Industry.objects.all(), many=True, required=False,
                                                    allow_empty=True)
    function = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    lwd = serializers.DateField(required=False, allow_null=True)
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), required=False, allow_null=True,
                                              allow_empty=True)
    cb_profile_link = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    ga_profile_link = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    status = serializers.CharField(required=False, allow_null=True, allow_blank=True)


class ListUserManagemenetRequestSerializer(serializers.Serializer):
    show_management = serializers.BooleanField(default=True)
    search = serializers.CharField(required=False)
    page = serializers.IntegerField(default=DEFAULT_PAGE_NUMBER)
    size = serializers.IntegerField(default=DEFAULT_PAGE_SIZE)

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class ListUserManagementResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    user_name = serializers.CharField()
    employee_id = serializers.CharField()
    group_name = serializers.CharField()
    group_id = serializers.IntegerField()


class EditUserGroupResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    employee_id = serializers.CharField()


class EditMultipleUserGroupRequestSerializer(serializers.Serializer):
    group_id = serializers.IntegerField()
    user_id = serializers.IntegerField()

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class ListGroupSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class ListCountriesResponseSerializer(serializers.Serializer):
    countries = serializers.ListField(child=serializers.CharField())


class ListCitiesRequestSerializer(serializers.Serializer):
    countries = serializers.ListField(child=serializers.CharField(), required=False)

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class ListCitiesResponseSerializer(serializers.Serializer):
    cities = serializers.ListField(child=serializers.CharField())
