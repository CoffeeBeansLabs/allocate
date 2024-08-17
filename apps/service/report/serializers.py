import csv
import datetime
import io

from django.db.models import F, IntegerField, ExpressionWrapper, Value
from django.db.models import When, CharField, Case, Q, Sum
from django.db.models.functions import Extract, Floor, Coalesce
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import serializers

from common.models import Industry
from project.constants import SerializerKeys
from project.models import ProjectAllocation
from report.constant import ReportKeys
from user.models import User, ProficiencyMapping
from user.serializers import UserDetailsProjectSerializer
from utils.utils import camel_to_snake


class ReportDateRequestSerializer(serializers.Serializer):
    startDate = serializers.DateField(required=True)
    endDate = serializers.DateField(required=True)

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class ReportCommonRequestSerializer(serializers.Serializer):

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class ReportLocationRequestSerializer(serializers.Serializer):
    location = serializers.CharField(required=True)

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class ReportCommonFieldSerializer(serializers.Field):
    def get_full_name(self, instance):
        full_name = instance.first_name + ' ' + instance.last_name
        return full_name

    def get_role(self, instance):
        role = instance.role
        if instance.role:
            role = instance.role.name
        return role

    def get_project_name(self, instance):
        allocations = ProjectAllocation.objects.filter(Q(user=instance))
        projects = UserDetailsProjectSerializer(allocations, many=True).data

        project_str = ''

        for i in projects:
            project_name = i['project_name']

            if project_name not in project_str:
                project_str = project_str + project_name + ', '

        return project_str

    def get_client_name(self, instance):
        allocations = ProjectAllocation.objects.filter(Q(user=instance))
        clients = UserDetailsProjectSerializer(allocations, many=True).data

        client_str = ''

        for i in clients:
            client_name = i['client']['name']

            if client_name not in client_str:
                client_str = client_str + client_name + ', '

        return client_str

    def get_skill(self, instance):
        skills = ProficiencyMapping.objects.filter(
            user=instance).values('skill__name')

        skills_str = ''

        for i in skills:
            skills_str = skills_str + i['skill__name'] + ', '

        return skills_str

    def get_total_experience_months(self, instance):
        user = User.objects.filter(id=instance.id).annotate(
            career_break_month=Coalesce('career_break_months', 0),
            user_experience_months=Coalesce(ExpressionWrapper(
                Floor((Extract(timezone.now().date() - F('career_start_date'), 'day')) / 30) - F(
                    'career_break_month'),
                output_field=IntegerField(),
            ), 0)).values('user_experience_months')

        return user[0]['user_experience_months']

    def get_experience_bucket(self, instance):
        users = User.objects.filter(id=instance.id).annotate(
            career_break_month=Coalesce('career_break_months', 0),
            user_experience_months=Coalesce(ExpressionWrapper(
                Floor((Extract(timezone.now().date() - F('career_start_date'), 'day')) / 30) - F(
                    'career_break_month'),
                output_field=IntegerField(),
            ), 0))

        user = users.annotate(
            experience_range=Case(
                When(user_experience_months__lte=24, then=Value('0–2')),
                When(user_experience_months__gte=25,
                     user_experience_months__lte=60, then=Value('2–5')),
                When(user_experience_months__gte=61,
                     user_experience_months__lte=96, then=Value('5–8')),
                When(user_experience_months__gte=97,
                     user_experience_months__lte=144, then=Value('8–12')),
                When(user_experience_months__gte=145, then=Value('12+')),
                default=Value(None),
                output_field=CharField()
            )
        ).values('experience_range')

        return user[0]['experience_range']

    def get_utilization(self, instance):
        allocations = ProjectAllocation.objects.filter(Q(user=instance),
                                                       Q(start_date__lte=datetime.date.today(
                                                       )),
                                                       (Q(end_date__gte=datetime.date.today()) | Q(end_date=None)))
        utilization = allocations.aggregate(Sum(SerializerKeys.UTILIZATION))[
            SerializerKeys.UTILIZATION_SUM]
        return utilization if utilization else 0


class ReportCafeResponseSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    client = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()
    skill = serializers.SerializerMethodField()
    total_experience_months = serializers.SerializerMethodField()
    experience_bucket = serializers.SerializerMethodField()
    utilization = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    def get_name(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_full_name(instance)

    def get_role(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_role(instance)

    def get_project(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_project_name(instance)

    def get_client(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_client_name(instance)

    def get_skill(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_skill(instance)

    def get_total_experience_months(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_total_experience_months(instance)

    def get_experience_bucket(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_experience_bucket(instance)

    def get_utilization(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_utilization(instance)

    class Meta:
        model = User
        fields = ('name', 'client', 'project', 'role', 'function', 'current_status', 'skill', 'total_experience_months',
                  'date_of_joining', 'last_working_day', 'utilization', 'experience_bucket', 'cb_profile_link')


class ReportPotentialCafeResponseSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    client = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()
    skill = serializers.SerializerMethodField()
    total_experience_months = serializers.SerializerMethodField()
    experience_bucket = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    def get_name(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_full_name(instance)

    def get_role(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_role(instance)

    def get_project(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_project_name(instance)

    def get_client(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_client_name(instance)

    def get_skill(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_skill(instance)

    def get_total_experience_months(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_total_experience_months(instance)

    def get_experience_bucket(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_experience_bucket(instance)

    class Meta:
        model = User
        fields = ('name', 'client', 'project', 'role', 'function', 'current_status', 'skill',
                  'total_experience_months', 'date_of_joining', 'last_working_day', 'employee_type',
                  'experience_bucket', 'cb_profile_link')


class ReportLocationResponseSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    client = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()
    skill = serializers.SerializerMethodField()
    total_experience_months = serializers.SerializerMethodField()
    experience_bucket = serializers.SerializerMethodField()
    utilization = serializers.SerializerMethodField()
    industry_experience = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    def get_name(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_full_name(instance)

    def get_role(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_role(instance)

    def get_project(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_project_name(instance)

    def get_client(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_client_name(instance)

    def get_skill(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_skill(instance)

    def get_total_experience_months(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_total_experience_months(instance)

    def get_experience_bucket(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_experience_bucket(instance)

    def get_utilization(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_utilization(instance)

    def get_industry_experience(self, instance):
        industries = list(Industry.objects.filter(
            user=instance).values_list('name', flat=True))
        industries_str = ''

        for i in industries:
            industries_str = i + ', '

        return industries_str

    class Meta:
        model = User
        fields = ('name', 'client', 'project', 'role', 'function', 'current_status', 'skill', 'gender',
                  'total_experience_months', 'date_of_joining', 'last_working_day', 'employee_type',
                  'experience_bucket', 'location', 'industry_experience', 'utilization')


class ReportLastWorkingDayResponseSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    client = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()
    skill = serializers.SerializerMethodField()
    total_experience_months = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    def get_name(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_full_name(instance)

    def get_role(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_role(instance)

    def get_project(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_project_name(instance)

    def get_client(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_client_name(instance)

    def get_skill(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_skill(instance)

    def get_total_experience_months(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_total_experience_months(instance)

    class Meta:
        model = User
        fields = ('name', 'client', 'project', 'role', 'function', 'skill', 'gender', 'current_status',
                  'total_experience_months', 'date_of_joining', 'last_working_day', 'location')


class ReportAnniversaryResponseSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    years_at_company = serializers.SerializerMethodField()
    total_experience_years = serializers.SerializerMethodField()
    anniversary = serializers.SerializerMethodField()
    is_lwd_before = serializers.SerializerMethodField()

    def get_name(self, instance):
        return instance.full_name

    def get_years_at_company(self, instance):
        (years, months) = divmod(instance.company_experience_months, 12)
        return f'{years} years {months} months'

    def get_total_experience_years(self, instance):
        (years, months) = divmod(instance.experience_months, 12)
        return f'{years} years {months} months'

    def get_anniversary(self, instance):
        return instance.anniversary

    def get_is_lwd_before(self, instance):
        if instance.anniversary:
            is_lwd_before = instance.last_working_day <= instance.anniversary if instance.last_working_day else False
            return ReportKeys.LWD_BEFORE_ANNIVERSARY if is_lwd_before else ""
        return ""

    class Meta:
        model = User
        fields = ('employee_id', 'name', 'years_at_company', 'total_experience_years', 'date_of_joining',
                  'is_lwd_before', 'anniversary', 'gender', 'function')


class ReportClientResponseSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    client = serializers.SerializerMethodField()
    project = serializers.SerializerMethodField()
    skill = serializers.SerializerMethodField()
    total_experience_months = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    def get_name(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_full_name(instance)

    def get_role(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_role(instance)

    def get_project(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_project_name(instance)

    def get_client(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_client_name(instance)

    def get_skill(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_skill(instance)

    def get_total_experience_months(self, instance):
        common_field_serializer = ReportCommonFieldSerializer()
        return common_field_serializer.get_total_experience_months(instance)

    class Meta:
        model = User
        fields = ('name', 'client', 'project', 'role', 'function', 'skill', 'gender', 'current_status',
                  'total_experience_months', 'date_of_joining', 'last_working_day', 'location')


def json_to_csv(json_data):
    # Prepare CSV data in memory
    csv_buffer = io.StringIO()

    # Create a CSV writer
    writer = csv.writer(csv_buffer)

    # Write the header row
    header = json_data[0].keys() if json_data else []
    writer.writerow(header)

    # Write the data rows
    for row in json_data:
        writer.writerow(row.values())

    # Create the HTTP response with CSV file
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="data.csv"'

    # Write CSV data to the response
    response.write(csv_buffer.getvalue())

    return response
