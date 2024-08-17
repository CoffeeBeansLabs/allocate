from rest_framework import serializers

from django.db.models import Value, Case, When
from django.db.models.functions import Concat
from django.db.models import Q, Sum

import datetime

from client.models import Client
from common.models import Skill
from common.serializers import SkillSerializer
from project.constants import ResponseKeys, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, RequestKeys, ErrorMessages, \
    SerializerKeys
from project.models import ProjectPOC, Project, ProjectPosition, ProjectRole, ProjectAllocation, \
    ProjectAllocationRequest, Notification
from user.models import Role, User, ProficiencyMapping, LeavePlans
from user.serializers import RoleSerializer, AccountManagerSerializer, ProficiencySerializer, LeavesSerializer, \
    SenderSerializer, ReceiverSerializer
from utils.utils import camel_to_snake


class ProjectPOCSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectPOC
        fields = ('name', 'email', 'phone_number', 'designation')


class CreateProjectRequestSerializer(serializers.ModelSerializer):
    pocs = ProjectPOCSerializer(many=True, required=False)

    class Meta:
        model = Project
        fields = ('name', 'client', 'status', 'city', 'country', 'start_date', 'end_date', 'currency', 'delivery_mode',
                  'engagement_type', 'pocs', 'account_manager', 'comment')


class PatchProjectRequestSerializer(serializers.Serializer):
    status = serializers.ChoiceField(Project.Status.choices, required=False)


class SetProjectResponseSerializer(serializers.ModelSerializer):
    client = serializers.SerializerMethodField()
    pocs = ProjectPOCSerializer(many=True)
    account_manager = AccountManagerSerializer()

    def get_client(self, instance):
        from client.serializers import ProjectClientSerializer
        return ProjectClientSerializer(instance.client).data

    class Meta:
        model = Project
        fields = ('id', 'name', 'client', 'status', 'city', 'country', 'start_date', 'end_date', 'currency',
                  'delivery_mode', 'engagement_type', 'pocs', 'account_manager', 'comment')


class ListProjectsRequestSerializer(serializers.Serializer):
    status = serializers.ChoiceField(Project.Status.choices, required=False)
    startDateStart = serializers.DateField(required=False)
    startDateEnd = serializers.DateField(required=False)
    search = serializers.CharField(required=False)
    page = serializers.IntegerField(default=DEFAULT_PAGE_NUMBER)
    size = serializers.IntegerField(default=DEFAULT_PAGE_SIZE)

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class RetrieveProjectResponseSerializer(serializers.ModelSerializer):
    pocs = ProjectPOCSerializer(many=True)
    client = serializers.SerializerMethodField()
    engagement_type = serializers.CharField(source='get_engagement_type_display')
    delivery_mode = serializers.CharField(source='get_delivery_mode_display')
    account_manager = AccountManagerSerializer()

    def get_client(self, instance):
        from client.serializers import ProjectClientSerializer
        return ProjectClientSerializer(instance.client).data

    class Meta:
        model = Project
        fields = ('id', 'name', 'status', 'city', 'country', 'start_date', 'pocs',
                  'delivery_mode', 'client', 'end_date', 'engagement_type', 'currency', 'account_manager', 'comment')


class EditProjectRequestSerializer(serializers.ModelSerializer):
    name = serializers.CharField()
    account_manager = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=True, allow_null=True)
    client = serializers.PrimaryKeyRelatedField(queryset=Client.objects.all(), required=True)
    pocs = ProjectPOCSerializer(many=True, required=True)

    class Meta:
        model = Project
        fields = ('name', 'client', 'status', 'city', 'country', 'start_date', 'end_date', 'currency', 'delivery_mode',
                  'engagement_type', 'pocs', 'account_manager', 'comment')


class ListProjectsResponseSerializer(serializers.ModelSerializer):
    client = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()

    def get_client(self, instance):
        from client.serializers import ProjectClientSerializer
        return ProjectClientSerializer(instance.client).data

    def get_duration(self, instance):
        if not instance.end_date:
            return '-'
        return ((
            instance.end_date.year - instance.start_date.year) * 12 + instance.end_date.month -
            instance.start_date.month)

    class Meta:
        model = Project
        fields = ('id', 'name', 'client', 'status', 'start_date', 'duration')


class ProjectCreationDropdownsResponseSerializer(serializers.Serializer):
    status = serializers.ListField(child=serializers.DictField())
    engagements = serializers.ListField(child=serializers.DictField())
    delivery_modes = serializers.ListField(child=serializers.DictField())
    clients = serializers.SerializerMethodField()
    account_manager = serializers.SerializerMethodField()

    def get_account_manager(self, instance):
        return AccountManagerSerializer(instance[ResponseKeys.ACCOUNT_MANAGERS], many=True).data

    def get_clients(self, instance):
        from client.serializers import ProjectClientSerializer
        return ProjectClientSerializer(instance[ResponseKeys.CLIENTS], many=True).data


class ProjectPositionDropdownsRequestSerializer(serializers.Serializer):
    search = serializers.CharField(required=False)


class ProjectPositionDropdownsResponseSerializer(serializers.Serializer):
    roles = RoleSerializer(many=True)
    skills = SkillSerializer(many=True)


class ProjectPositionRequestSerializer(serializers.ModelSerializer):
    skills = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all(), many=True)

    def validate(self, attrs):
        start_date = attrs.get(RequestKeys.START_DATE)
        end_date = attrs.get(RequestKeys.END_DATE)
        if end_date and start_date > end_date:
            raise serializers.ValidationError(ErrorMessages.START_DATE_GREATER_THAN_END_DATE)
        return attrs

    class Meta:
        model = ProjectPosition
        fields = ('skills', 'utilization', 'is_billable', 'start_date', 'end_date', 'experience_range_start',
                  'experience_range_end')


class CreateProjectPositionRequestSerializer(serializers.Serializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all())
    positions = ProjectPositionRequestSerializer(many=True)


class CreateProjectPositionRequestSerializerResponse(serializers.ModelSerializer):
    class Meta:
        model = ProjectPosition
        fields = ('id', 'utilization', 'is_billable')


class EditProjectPositionSerializer(serializers.ModelSerializer):
    skills = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all(), many=True)
    end_date = serializers.DateField(required=True, allow_null=True)
    is_billable = serializers.BooleanField(required=True)

    def validate(self, attrs):
        start_date = attrs.get(RequestKeys.START_DATE)
        end_date = attrs.get(RequestKeys.END_DATE)
        if end_date and start_date > end_date:
            raise serializers.ValidationError(ErrorMessages.START_DATE_GREATER_THAN_END_DATE)
        return attrs

    class Meta:
        model = ProjectPosition
        fields = ('id', 'utilization', 'is_billable', 'start_date', 'end_date', 'skills')


class ClientDetailProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'name', 'status', 'start_date', 'end_date')


class CreateProjectAllocationRequestSerializer(serializers.ModelSerializer):
    end_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = ProjectAllocation
        fields = ('user', 'position', 'utilization', 'start_date', 'end_date', 'kt_period')


class CreateAllocationRequestSerializer(serializers.ModelSerializer):
    end_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = ProjectAllocationRequest
        fields = ('user', 'position', 'utilization', 'start_date', 'end_date', 'kt_period')


class EditProjectAllocationRequestSerializer(serializers.ModelSerializer):
    end_date = serializers.DateField(required=True, allow_null=True)

    def validate(self, attrs):
        start_date = datetime.date.today()
        end_date = attrs.get(RequestKeys.END_DATE)
        if start_date > end_date:
            raise serializers.ValidationError(ErrorMessages.START_DATE_GREATER_THAN_END_DATE)
        return attrs

    class Meta:
        model = ProjectAllocationRequest
        fields = ('allocation', 'utilization', 'end_date')


class EditProjectAllocationSerializer(serializers.ModelSerializer):
    end_date = serializers.DateField(required=True, allow_null=True)

    def validate(self, attrs):
        start_date = datetime.date.today()
        end_date = attrs.get(RequestKeys.END_DATE)
        if start_date > end_date:
            raise serializers.ValidationError(ErrorMessages.START_DATE_GREATER_THAN_END_DATE)
        return attrs

    class Meta:
        model = ProjectAllocation
        fields = ('utilization', 'end_date', 'user')


class ProjectAllocationSerializer(serializers.ModelSerializer):
    position_id = serializers.IntegerField(source='position.id')
    project_name = serializers.CharField(source='position.project_role.project.name')
    is_same_project = serializers.SerializerMethodField()

    def get_is_same_project(self, instance):
        project_id = self.context.get(SerializerKeys.PROJECT_ID)
        is_same_project = instance.position.project_role.project.id == project_id
        return is_same_project

    class Meta:
        model = ProjectAllocation
        fields = ('id', 'position_id', 'project_name', 'is_same_project', 'utilization', 'kt_period',
                  'start_date', 'end_date')


class AllocationRequestedUserSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="position.project_role.project.name")

    class Meta:
        model = ProjectAllocationRequest
        fields = ('id', 'project_name', 'utilization', 'kt_period', 'start_date', 'end_date')


class ProjectUserSerializer(serializers.ModelSerializer):
    projects = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    role = RoleSerializer()
    leave_plans = serializers.SerializerMethodField()
    requests = serializers.SerializerMethodField()
    is_over_utilized = serializers.SerializerMethodField()

    def get_projects(self, instance):
        response_date_start = self.context.get(SerializerKeys.RESPONSE_DATE_START)
        response_date_end = self.context.get(SerializerKeys.RESPONSE_DATE_END)
        search = self.context.get(SerializerKeys.SEARCH)
        project_id = self.context.get(SerializerKeys.PROJECT_ID)
        allocations = ProjectAllocation.objects.filter(user=instance)

        if response_date_start:
            allocations = allocations.filter(Q(end_date__gte=response_date_start) | Q(end_date__isnull=True))
        if response_date_end:
            allocations = allocations.filter(start_date__lte=response_date_end)

        return ProjectAllocationSerializer(allocations, many=True,
                                           context={SerializerKeys.SEARCH: search,
                                                    SerializerKeys.PROJECT_ID: project_id,
                                                    SerializerKeys.RESPONSE_DATE_START: response_date_start,
                                                    SerializerKeys.RESPONSE_DATE_END: response_date_end}).data

    def get_skills(self, instance):
        proficiency_mapping = ProficiencyMapping.objects.filter(user=instance).order_by('-rating').exclude(rating=0)
        return ProficiencySerializer(proficiency_mapping, many=True).data

    def get_leave_plans(self, instance):
        response_date_start = self.context.get(SerializerKeys.RESPONSE_DATE_START)
        response_date_end = self.context.get(SerializerKeys.RESPONSE_DATE_END)
        leaves = LeavePlans.objects.filter(user=instance).exclude(approval_status__in=['Cancelled', 'Rejected'])
        if response_date_start:
            leaves = leaves.filter(to_date__gte=response_date_start)
        if response_date_end:
            leaves = leaves.filter(from_date__lte=response_date_end)

        return LeavesSerializer(leaves, many=True).data

    def get_requests(self, instance):
        project_id = self.context.get(SerializerKeys.PROJECT_ID)
        project_allocation_request = ProjectAllocationRequest.objects.filter(
            Q(status=ProjectAllocationRequest.Status.PENDING),
            Q(user=instance),
            Q(position__project_role__project=project_id))
        return AllocationRequestedUserSerializer(project_allocation_request, many=True).data

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

    class Meta:
        model = User
        fields = (
            'id', 'full_name_with_exp_band', 'is_over_utilized', 'experience_months', 'last_working_day', 'requests',
            'role', 'skills', 'leave_plans', 'projects')


class ProjectPositionSerializer(serializers.ModelSerializer):
    users = serializers.SerializerMethodField()
    skills = SkillSerializer(many=True)

    def get_users(self, instance):
        search = self.context.get(SerializerKeys.SEARCH)
        project_id = self.context.get(SerializerKeys.PROJECT_ID)
        response_date_start = self.context.get(SerializerKeys.RESPONSE_DATE_START)
        response_date_end = self.context.get(SerializerKeys.RESPONSE_DATE_END)
        filter_users = self.context.get(SerializerKeys.FILTER_USERS)
        users = instance.allocation.values(SerializerKeys.USER)
        requested_users = instance.allocation_requests.values(SerializerKeys.USER)
        users = users.union(requested_users)
        users = User.objects.filter(id__in=users)
        if search and filter_users:
            users = users.annotate(
                user_name=Concat('first_name', Value(' '), 'last_name')).filter(
                Q(user_name__icontains=search))
        return ProjectUserSerializer(users, many=True,
                                     context={SerializerKeys.SEARCH: search, SerializerKeys.PROJECT_ID: project_id,
                                              SerializerKeys.RESPONSE_DATE_START: response_date_start,
                                              SerializerKeys.RESPONSE_DATE_END: response_date_end}).data

    class Meta:
        model = ProjectPosition
        fields = (
            'id', 'experience_range_start', 'experience_range_end', 'start_date', 'end_date', 'utilization', 'skills',
            'users', 'is_billable')


class ProjectRoleSerializer(serializers.ModelSerializer):
    project_role_id = serializers.IntegerField(source='id')
    role_name = serializers.CharField(source='role.name')
    positions = serializers.SerializerMethodField()
    total_positions = serializers.SerializerMethodField()
    open_positions = serializers.SerializerMethodField()

    def get_positions(self, instance):
        search = self.context.get(SerializerKeys.SEARCH)
        project_id = self.context.get(SerializerKeys.PROJECT_ID)
        response_date_start = self.context.get(SerializerKeys.RESPONSE_DATE_START)
        response_date_end = self.context.get(SerializerKeys.RESPONSE_DATE_END)
        filter_users = getattr(instance, SerializerKeys.FILTER_USERS, '1')
        positions = instance.positions.all().order_by('id')

        if search and instance.filter_users:
            positions = positions.annotate(
                user_name=Concat('allocation__user__first_name', Value(' '), 'allocation__user__last_name'),
                request_user=Concat('allocation_requests__user__first_name', Value(' '),
                                    'allocation_requests__user__last_name')).filter(
                Q(user_name__icontains=search) | Q(request_user__icontains=search))
            positions = positions.distinct('id')
        return ProjectPositionSerializer(positions, many=True,
                                         context={SerializerKeys.SEARCH: search, SerializerKeys.PROJECT_ID: project_id,
                                                  SerializerKeys.RESPONSE_DATE_START: response_date_start,
                                                  SerializerKeys.RESPONSE_DATE_END: response_date_end,
                                                  SerializerKeys.FILTER_USERS: filter_users}).data

    def get_total_positions(self, instance):
        return instance.positions.count()

    def get_open_positions(self, instance):
        return instance.positions.filter(allocation__user__isnull=True).count()

    class Meta:
        model = ProjectRole
        fields = ('project_role_id', 'role_name', 'total_positions', 'open_positions', 'positions')


class RetrieveProjectTimelineResponseSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    total_positions = serializers.SerializerMethodField()
    open_positions = serializers.SerializerMethodField()

    def get_roles(self, instance):
        search = self.context.get(SerializerKeys.SEARCH)
        project_id = self.context.get(SerializerKeys.PROJECT_ID)

        response_date_start = self.context.get(SerializerKeys.RESPONSE_DATE_START)
        response_date_end = self.context.get(SerializerKeys.RESPONSE_DATE_END)
        project_roles = instance.roles.exclude(positions__isnull=True)

        if search:
            project_roles = project_roles.annotate(
                user_name=Concat('positions__allocation__user__first_name', Value(' '),
                                 'positions__allocation__user__last_name'
                                 ), request_user=Concat('positions__allocation_requests__user__first_name', Value(' '),
                                                        'positions__allocation_requests__user__last_name'))
            project_roles = project_roles.annotate(
                filter_users=Case(When(role__name__icontains=search, then=0), default=Value(1)))

            project_roles = project_roles.filter(
                Q(role__name__icontains=search) | Q(user_name__icontains=search) | Q(request_user__icontains=search))
            project_roles = project_roles.distinct('id')
        return ProjectRoleSerializer(project_roles, many=True,
                                     context={SerializerKeys.SEARCH: search, SerializerKeys.PROJECT_ID: project_id,
                                              SerializerKeys.RESPONSE_DATE_START: response_date_start,
                                              SerializerKeys.RESPONSE_DATE_END: response_date_end}).data

    def get_total_positions(self, instance):
        return instance.roles.exclude(positions__isnull=True).values(SerializerKeys.POSITIONS).count()

    def get_open_positions(self, instance):
        allocated_user = instance.roles.filter(Q(positions__isnull=False) & Q(positions__allocation__user__isnull=True))
        return allocated_user.count()

    class Meta:
        model = Project
        fields = ('name', 'start_date', 'total_positions', 'open_positions', 'end_date', 'roles')


class RetrieveProjectTimelineRequestSerializer(serializers.Serializer):
    search = serializers.CharField(required=False)
    responseDateStart = serializers.DateField(required=False)
    responseDateEnd = serializers.DateField(required=False)

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class PatchProjectAllocationRequestSerializer(serializers.Serializer):
    status = serializers.ChoiceField(ProjectAllocationRequest.Status.choices, required=False)


class NotificationRequestSerializer(serializers.ModelSerializer):
    notification_type = serializers.CharField(source='get_notification_type_display')
    sender = SenderSerializer()
    receiver = ReceiverSerializer()

    class Meta:
        model = Notification
        fields = ('id', 'notification_type', 'sender', 'receiver', 'unseen', 'object_id', 'json_data', 'created_time',
                  'modified_time')
