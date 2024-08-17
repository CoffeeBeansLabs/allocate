from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.fields import GenericRelation

from client.models import Client
from common.models import Skill
from user.models import User, Role


class Project(models.Model):
    class Status(models.TextChoices):
        COLD = 'COLD', 'Cold'
        WARM = 'WARM', 'Warm'
        HOT = 'HOT', 'Hot'
        SIGNED = 'SIGNED', 'Signed'
        ACTIVE = 'ACTIVE', 'Active'
        CLOSED = 'CLOSED', 'Closed'

    class Engagement(models.TextChoices):
        FR = 'FR', 'Fixed Rate'
        TM = 'TM', 'Time and Material'

    class DeliveryMode(models.TextChoices):
        ONSITE = 'ONSITE', 'Onsite'
        HYBRID = 'HYBRID', 'Hybrid'
        REMOTE = 'REMOTE', 'Remote'

    PRIVILEGED_STATUSES = [Status.SIGNED, Status.ACTIVE, Status.CLOSED]

    name = models.CharField(unique=True, max_length=100)
    status = models.CharField(max_length=30, choices=Status.choices)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True)
    currency = models.CharField(max_length=50, null=True)
    engagement_type = models.CharField(max_length=20, choices=Engagement.choices, null=True)
    delivery_mode = models.CharField(max_length=20, choices=DeliveryMode.choices, null=True)
    client = models.ForeignKey(Client, related_name='projects', on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, related_name='projects_created', on_delete=models.SET_NULL, null=True)
    created_time = models.DateTimeField(auto_now_add=True)
    modified_time = models.DateTimeField(auto_now=True)
    account_manager = models.ForeignKey(User, related_name='projects_managed', on_delete=models.SET_NULL, null=True)
    comment = models.CharField(max_length=250, null=True)

    objects = models.Manager()

    class Meta:
        db_table = 'project'
        permissions = [('set_privileged_project_status', 'Can set privileged project status')]


class ProjectPOC(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(null=True)
    phone_number = models.CharField(max_length=20, null=True)
    project = models.ForeignKey(Project, related_name='pocs', on_delete=models.CASCADE)
    designation = models.CharField(max_length=20, null=True)

    objects = models.Manager()

    class Meta:
        db_table = 'project_pocs'


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        NEW_ALLOCATION = 'NEW_ALLOCATION', 'New_Allocation'
        ALLOCATION_CHANGE = 'ALLOCATION_CHANGE', 'Allocation_Change'
        DELETE_ALLOCATION = 'DELETE_ALLOCATION', 'Delete_Allocation'
        NEW_ALLOCATION_REQUEST = 'NEW_ALLOCATION_REQUEST', 'New_Allocation_Request'
        APPROVED_ALLOCATION_REQUEST = 'APPROVED_ALLOCATION_REQUEST', 'Approved_Allocation_Request'
        CANCEL_ALLOCATION_REQUEST = 'CANCEL_ALLOCATION_REQUEST', 'Cancel_Allocation_Request'
        ALLOCATION_CHANGE_REQUEST = 'ALLOCATION_CHANGE_REQUEST', 'Allocation_Change_Request'
        APPROVED_ALLOCATION_CHANGE_REQUEST = 'APPROVED_ALLOCATION_CHANGE_REQUEST', 'Approved_Allocation_Change_Request'
        CANCEL_ALLOCATION_CHANGE_REQUEST = 'CANCEL_ALLOCATION_CHANGE_REQUEST', 'Cancel_Allocation_Change_Request'

    notification_type = models.CharField(max_length=50, choices=NotificationType.choices, null=True)
    sender = models.ForeignKey(User, related_name='sender', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='receiver', on_delete=models.CASCADE)
    unseen = models.BooleanField(default=True)
    object_id = models.PositiveIntegerField(null=True)
    content_type = models.ForeignKey(ContentType, null=True, on_delete=models.CASCADE)
    object = GenericForeignKey('content_type', 'object_id')
    json_data = models.JSONField(null=True)
    created_time = models.DateTimeField(auto_now_add=True)
    modified_time = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notification'
        permissions = [('admin_notification', 'Can be admin notified')]


class ProjectRole(models.Model):
    project = models.ForeignKey(Project, related_name='roles', on_delete=models.CASCADE)
    role = models.ForeignKey(Role, related_name='projects', on_delete=models.PROTECT)

    objects = models.Manager()

    class Meta:
        db_table = 'project_role'
        unique_together = (('project', 'role'),)


class ProjectPosition(models.Model):
    project_role = models.ForeignKey(ProjectRole, related_name='positions', on_delete=models.CASCADE)
    skills = models.ManyToManyField(Skill, through='ProjectPositionSkills')
    experience_range_start = models.IntegerField()
    experience_range_end = models.IntegerField()
    utilization = models.IntegerField()
    is_billable = models.BooleanField(default=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True)
    created_time = models.DateTimeField(auto_now_add=True)
    modified_time = models.DateTimeField(auto_now=True)

    objects = models.Manager()

    class Meta:
        db_table = 'project_position'


class ProjectPositionHistory(models.Model):
    position = models.ForeignKey(ProjectPosition, on_delete=models.CASCADE)
    utilization = models.IntegerField()
    is_billable = models.BooleanField(default=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_time = models.DateTimeField()
    modified_time = models.DateTimeField()

    objects = models.Manager()

    class Meta:
        db_table = 'project_position_history'


class ProjectPositionSkills(models.Model):
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    position = models.ForeignKey(ProjectPosition, on_delete=models.CASCADE)
    priority = models.IntegerField()

    objects = models.Manager()

    class Meta:
        db_table = 'project_position_skills'


class ProjectAllocation(models.Model):
    user = models.ForeignKey(User, related_name='allocation', on_delete=models.CASCADE)
    position = models.ForeignKey(ProjectPosition, related_name='allocation', on_delete=models.CASCADE)
    utilization = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField(null=True)
    kt_period = models.IntegerField(default=0)
    tentative = models.BooleanField(default=False)
    created_time = models.DateTimeField(auto_now_add=True)
    modified_time = models.DateTimeField(auto_now=True)
    notification = GenericRelation(Notification)

    objects = models.Manager()

    class Meta:
        db_table = 'project_allocation'


class ProjectAllocationHistory(models.Model):
    allocation = models.ForeignKey(ProjectAllocation, on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='allocation_history', on_delete=models.CASCADE)
    position = models.ForeignKey(ProjectPosition, related_name='allocation_history', on_delete=models.CASCADE)
    utilization = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField(null=True)
    kt_period = models.IntegerField(default=0)
    tentative = models.BooleanField(default=False)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_time = models.DateTimeField()
    modified_time = models.DateTimeField()

    objects = models.Manager()

    class Meta:
        db_table = 'project_allocation_history'


class ProjectAllocationRequest(models.Model):
    class Status(models.TextChoices):
        APPROVED = 'APPROVED', 'Approved'
        PENDING = 'PENDING', 'Pending'
        DENIED = 'DENIED', 'Denied'

    allocation = models.ForeignKey(ProjectAllocation, related_name='allocation', on_delete=models.CASCADE, null=True)
    user = models.ForeignKey(User, related_name='allocation_requests', on_delete=models.CASCADE)
    position = models.ForeignKey(ProjectPosition, related_name='allocation_requests', on_delete=models.CASCADE)
    utilization = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField(null=True)
    kt_period = models.IntegerField(default=0)
    tentative = models.BooleanField(default=False)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING)
    requested_by = models.ForeignKey(User, related_name='allocations_requested', on_delete=models.SET_NULL, null=True)
    handler = models.ForeignKey(User, related_name='allocations_handled', on_delete=models.SET_NULL, null=True)
    created_time = models.DateTimeField(auto_now_add=True)
    modified_time = models.DateTimeField(auto_now=True)
    notification = GenericRelation(Notification)

    objects = models.Manager()

    class Meta:
        db_table = 'project_allocation_request'
