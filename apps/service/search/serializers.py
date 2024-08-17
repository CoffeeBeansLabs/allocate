import datetime
from itertools import chain

from django.db.models import Q
from rest_framework import serializers

from common.models import Skill
from common.serializers import SkillSerializer
from project.models import ProjectPosition, ProjectAllocation, Project, ProjectAllocationRequest
from search.constants import DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, SerializerKeys
from user.models import User, LeavePlans, ProficiencyMapping, Role
from utils.utils import camel_to_snake
from user.serializers import TalentAllocationResponseSerializer, RoleSerializer


class SearchTalentRequestSerializer(serializers.Serializer):
    position = serializers.PrimaryKeyRelatedField(
        queryset=ProjectPosition.objects.all())
    search = serializers.CharField(required=False)
    relatedSuggestions = serializers.BooleanField(default=False)
    page = serializers.IntegerField(default=DEFAULT_PAGE_NUMBER)
    size = serializers.IntegerField(default=DEFAULT_PAGE_SIZE)
    responseDateStart = serializers.DateField(required=False)
    responseDateEnd = serializers.DateField(required=False)
    locations = serializers.ListField(child=serializers.CharField(max_length=50),
                                      required=False, allow_null=True)

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        for attr in self.initial_data:
            if attr.endswith("[]"):
                data[attr[:-2]] = self.initial_data.getlist(attr)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class SearchTalentCriteriaSerializer(serializers.Serializer):
    role = serializers.CharField(source='project_role.role.name')
    project_name = serializers.CharField(source='project_role.project.name')
    skills = SkillSerializer(many=True)
    experience_range_start = serializers.IntegerField()
    experience_range_end = serializers.IntegerField()
    utilization = serializers.IntegerField()
    start_date = serializers.DateField()
    end_date = serializers.DateField()


class QuickSearchTalentCriteriaSerializer(serializers.Serializer):
    role = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), required=False, allow_null=True)
    skills = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), many=True)
    projects = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), many=True, required=False,
                                                  allow_null=True)
    experience_range_start = serializers.IntegerField(allow_null=True)
    experience_range_end = serializers.IntegerField(allow_null=True)
    utilization = serializers.IntegerField(allow_null=True)
    start_date = serializers.DateField(allow_null=True)
    end_date = serializers.DateField(allow_null=True)
    page = serializers.IntegerField(
        default=DEFAULT_PAGE_NUMBER, allow_null=True)
    size = serializers.IntegerField(default=DEFAULT_PAGE_SIZE, allow_null=True)
    response_date_start = serializers.DateField(
        required=False, allow_null=True)
    response_date_end = serializers.DateField(required=False, allow_null=True)
    related_suggestions = serializers.BooleanField(
        default=False, allow_null=True)
    search = serializers.CharField(
        max_length=30, required=False, allow_null=True)
    locations = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        allow_null=True
    )


class TalentProficiencySerializer(serializers.ModelSerializer):
    skill = serializers.CharField(source='skill.name')
    skill_id = serializers.SerializerMethodField()

    def get_skill_id(self, instance):
        return instance.skill.id

    class Meta:
        model = ProficiencyMapping
        fields = ('skill_id', 'skill', 'rating')


class TalentAllocationSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(
        source='position.project_role.project.name')
    is_same_project = serializers.SerializerMethodField()
    position_id = serializers.SerializerMethodField()
    position_role = serializers.SerializerMethodField()

    def get_is_same_project(self, instance):
        projects = self.context.get('projects')
        if projects:
            return instance.position.project_role.project in projects
        return False

    def get_position_id(self, instance):
        return instance.position.id

    def get_position_role(self, instance):
        role = instance.position.project_role.role
        return RoleSerializer(role).data

    class Meta:
        model = ProjectAllocation
        fields = ('project_name', 'is_same_project', 'position_id', 'position_role', 'kt_period',
                  'utilization', 'start_date', 'end_date')


class TalentKTDetailSerializer(serializers.ModelSerializer):
    is_talent_on_kt_period = serializers.SerializerMethodField()
    kt_period_start_date = serializers.SerializerMethodField()
    kt_period_end_date = serializers.SerializerMethodField()

    def get_kt_period_start_date(self, instance):
        return instance.start_date - datetime.timedelta(days=instance.kt_period)

    def get_kt_period_end_date(self, instance):
        return instance.start_date

    def get_is_talent_on_kt_period(self, instance):
        return self.get_kt_period_start_date(instance) <= datetime.date.today() <= self.get_kt_period_end_date(instance)

    class Meta:
        model = ProjectAllocation
        fields = ('is_talent_on_kt_period',
                  'kt_period_start_date', 'kt_period_end_date')


class TalentLeavesSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeavePlans
        fields = ('from_date', 'to_date')


class SearchTalentResponseSerializer(serializers.ModelSerializer):
    match_percent = serializers.SerializerMethodField()
    role = serializers.CharField(source='role.name', allow_null=True)
    skills = serializers.SerializerMethodField()
    allocation = serializers.SerializerMethodField()
    leaves = serializers.SerializerMethodField()
    kt_period_detail = serializers.SerializerMethodField()
    requests = serializers.SerializerMethodField()

    def get_match_percent(self, instance):
        return f'{instance.score}%'

    def get_skills(self, instance):
        skills = self.context.get(SerializerKeys.SKILLS)
        proficiency = ProficiencyMapping.objects.filter(user=instance, skill__in=skills).order_by('-rating').exclude(
            rating=0)
        proficiency = chain(proficiency, ProficiencyMapping.objects.filter(user=instance).order_by('-rating')
                            .exclude(Q(skill__in=skills) | Q(rating=0)))

        return TalentProficiencySerializer(proficiency, many=True).data

    def get_allocation(self, instance):
        response_date_start = self.context.get(
            SerializerKeys.RESPONSE_DATE_START)
        response_date_end = self.context.get(SerializerKeys.RESPONSE_DATE_END)
        projects = self.context.get(SerializerKeys.PROJECTS)

        allocations = ProjectAllocation.objects.filter(user=instance) \
            .select_related('position__project_role__project')
        if response_date_start:
            allocations = allocations.filter(
                Q(end_date__gte=response_date_start) | Q(end_date__isnull=True))
        if response_date_end:
            allocations = allocations.filter(start_date__lte=response_date_end)

        return TalentAllocationSerializer(allocations, many=True,
                                          context={SerializerKeys.PROJECTS: projects}).data

    def get_leaves(self, instance):
        response_date_start = self.context.get(
            SerializerKeys.RESPONSE_DATE_START)
        response_date_end = self.context.get(SerializerKeys.RESPONSE_DATE_END)

        leaves = LeavePlans.objects.filter(
            user=instance, approval_status='Approved')
        if response_date_start:
            leaves = leaves.filter(to_date__gte=response_date_start)
        if response_date_end:
            leaves = leaves.filter(from_date__lte=response_date_end)

        return TalentLeavesSerializer(leaves, many=True).data

    def get_kt_period_detail(self, instance):
        response_date_start = self.context.get(
            SerializerKeys.RESPONSE_DATE_START)
        response_date_end = self.context.get(SerializerKeys.RESPONSE_DATE_END)

        allocations = ProjectAllocation.objects.filter(user=instance) \
            .select_related('position__project_role__project')
        if response_date_start:
            allocations = allocations.filter(
                Q(end_date__gte=response_date_start) | Q(end_date__isnull=True))
        if response_date_end:
            allocations = allocations.filter(start_date__lte=response_date_end)
        return TalentKTDetailSerializer(allocations, many=True).data

    def get_requests(self, instance):
        project_allocation_request = ProjectAllocationRequest.objects.filter(
            Q(status=ProjectAllocationRequest.Status.PENDING),
            Q(user=instance))
        return TalentAllocationResponseSerializer(project_allocation_request, many=True).data

    class Meta:
        model = User
        fields = (
            'id', 'full_name_with_exp_band', 'kt_period_detail', 'match_percent', 'role', 'skills',
            'experience_months', 'requests', 'allocation', 'leaves', 'work_location', 'last_working_day'
        )


class UniversalSearchUserResponseSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, instance):
        return instance.name

    class Meta:
        model = User
        fields = ('id', 'name')


class UniversalSearchClientResponseSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, instance):
        return instance.name

    class Meta:
        model = User
        fields = ('id', 'name')


class UniversalSearchProjectResponseSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_name(self, instance):
        return instance.name

    class Meta:
        model = User
        fields = ('id', 'name')


class QuickSearchRequestSerializer(serializers.Serializer):
    search = serializers.CharField(required=True)
