import datetime

from django.contrib.postgres.aggregates import ArrayAgg
from django.db.models import Count, When, CharField, Case, Q, DateField
from django.db.models import F, IntegerField, ExpressionWrapper, BooleanField, Value
from django.db.models.expressions import RawSQL
from django.db.models.functions import Extract, Floor, Coalesce, Concat, Cast
from django.utils import timezone

from common.models import Industry
from dashboard.models import AddYearInterval
from project.models import ProjectAllocation, Client, ProjectRole
from user.models import User, ProficiencyMapping
from user.services import list_cafe_users
from user.constants import CurrentStatusKeys


class DashboardService:

    def dashboard_employees_detail(self):
        user = User.objects.filter(Q(status='Active'))
        return user

    def dashboard_allocated_employee(self):
        users = User.objects.filter(
            status='Active', career_start_date__isnull=False).exclude(current_status='Cafe')
        users = users.annotate(
            career_break_month=Coalesce('career_break_months', 0),
            user_name=Concat('first_name', Value(' '), 'last_name'),
            user_experience_months=Coalesce(ExpressionWrapper(
                Floor((Extract(timezone.now().date() - F('career_start_date'), 'day')) / 30) - F(
                    'career_break_month'),
                output_field=IntegerField(),
            ), 0))

        users = users.annotate(
            experience_range=Case(
                When(user_experience_months__lte=24, then=Value('0-2')),
                When(user_experience_months__gte=25,
                     user_experience_months__lte=60, then=Value('2-5')),
                When(user_experience_months__gte=61,
                     user_experience_months__lte=96, then=Value('5-8')),
                When(user_experience_months__gte=97,
                     user_experience_months__lte=144, then=Value('8-12')),
                When(user_experience_months__gte=145, then=Value('12+')),
                default=Value(None),
                output_field=CharField()
            )
        )

        users = users.values('role__name', 'experience_range').annotate(count=Count('id')).order_by(
            'role__name').annotate(role_name=F('role__name'))

        return users

    def dashboard_skill_experience(self, sort_asc=True):

        order_by_field_name = "skill_name"

        if not sort_asc:
            order_by_field_name = "-" + order_by_field_name

        skill_users = ProficiencyMapping.objects.select_related('user') \
            .filter(user__status='Active', user__career_start_date__isnull=False)
        skill_users = skill_users.annotate(
            skill_name=Coalesce('skill__name', None),
            career_break_month=Coalesce('user__career_break_months', 0),
            user_experience_months=Coalesce(ExpressionWrapper(
                Floor((Extract(timezone.now().date() - F('user__career_start_date'), 'day')) / 30) - F(
                    'career_break_month'),
                output_field=IntegerField(),
            ), 0))

        skill_users = skill_users.annotate(experience_range=Case(
            When(user_experience_months__lte=24, then=Value('0-2')),
            When(user_experience_months__gte=25,
                 user_experience_months__lte=60, then=Value('2-5')),
            When(user_experience_months__gte=61,
                 user_experience_months__lte=96, then=Value('5-8')),
            When(user_experience_months__gte=97,
                 user_experience_months__lte=144, then=Value('8-12')),
            When(user_experience_months__gte=145, then=Value('12+')),
            default=Value(None),
            output_field=CharField()
        )
        )
        skill_users = skill_users.values('skill_name', 'experience_range').annotate(count=Count('id')) \
            .order_by(order_by_field_name, 'experience_range')

        return skill_users

    def dashboard_skill(self, current_status=None, sort_asc=True):
        order_by_field_name = "skill__name"
        if not sort_asc:
            order_by_field_name = "-" + order_by_field_name

        if current_status == 'cafe':
            skill = (
                ProficiencyMapping.objects.filter(
                    user__current_status='Cafe', rating__gt=0, user__status='Active')
                .values('skill__name', 'skill_id', 'rating')
                .annotate(count=Count('rating'))
                .order_by(order_by_field_name, 'skill_id', 'rating')
            )
        elif current_status == 'potential_cafe':
            potential_cafe_user_ids = list(
                list_cafe_users().filter(current_status=CurrentStatusKeys.FULLY_ALLOCATED)
                .values_list('id', flat=True))

            skill = (
                ProficiencyMapping.objects
                .filter(user_id__in=potential_cafe_user_ids, rating__gt=0)
                .values('skill__name', 'skill_id', 'rating')
                .annotate(count=Count('rating'))
                .order_by(order_by_field_name, 'skill_id', 'rating')
            )
        else:
            skill = (
                ProficiencyMapping.objects.filter(
                    rating__gt=0, user__status='Active')
                .values('skill__name', 'skill_id', 'rating')
                .annotate(count=Count('rating'))
                .order_by(order_by_field_name, 'skill_id', 'rating')
            )
        return skill

    def dashboard_project_allocation(self, project_id=None, role_id=None, sort_asc=True):
        order_by = ""
        if not sort_asc:
            order_by = "-"

        current_date = datetime.date.today()

        project_roles = ProjectRole.objects.filter(
            positions__allocation__start_date__lte=current_date,
            positions__allocation__end_date__gte=current_date,
            positions__allocation__utilization__gt=0
        ).annotate(current_allocations=ArrayAgg(
            Cast('positions__allocation__id', output_field=IntegerField())
        )).filter(current_allocations__isnull=False)

        if project_id is not None:
            order_by += "role__name"
            project_roles = project_roles.filter(
                project__id=project_id).order_by(order_by)

        if role_id is not None:
            order_by += "project__name"
            project_roles = project_roles.filter(
                role__id=role_id).order_by(order_by)

        return project_roles

    def dashboard_anniversaries(self, month, year):

        employees = User.objects.filter(Q(date_of_joining__month=month), Q(status='Active'),
                                        ~Q(current_status='Closed')) \
            .annotate(years=year - F('date_of_joining__year'),
                      full_name=Concat('first_name', Value(' '), 'last_name'),
                      anniversary=ExpressionWrapper(F("date_of_joining") + AddYearInterval(F('years')),
                                                    output_field=DateField()),
                      is_lwd_before=Case(When(Q(last_working_day__lte=F('anniversary')),
                                              then=True), default=False, output_field=BooleanField())
                      ) \
            .values('years', 'full_name', 'date_of_joining', 'anniversary', 'is_lwd_before')

        return employees

    def dashboard_lwd(self, month, year):
        employees = User.objects.filter(Q(last_working_day__month=month), Q(last_working_day__year=year),
                                        Q(status='Active')) \
            .annotate(full_name=Concat('first_name', Value(' '), 'last_name'), role_name=Coalesce('role__name', None)) \
            .values('full_name', 'last_working_day', 'role_name', 'id')

        return employees

    def dashboard_client_allocation(self, sort_asc=True):
        order_by = "name"
        if not sort_asc:
            order_by = "-" + order_by

        current_time = timezone.now()
        project_allocations = ProjectAllocation.objects.filter(
            start_date__lte=current_time, end_date__gte=current_time)
        clients = (Client.objects.filter(projects__roles__positions__allocation__in=project_allocations).annotate(
            allocation_count=Count('projects__roles__positions__allocation__user_id', distinct=True))
            .order_by(order_by))

        return clients

    def dashboard_project_open_position(self, project_id=None, role_id=None, sort_asc=True):
        order_by = ""
        if not sort_asc:
            order_by = "-"

        query = """
                 with
                 day_wise_position_allocation as (
                    select
                        position_id,
                        generate_series(start_date, end_date, '1 day')::date as day,
                        coalesce(sum(utilization), 0) as total_util
                    from project_allocation
                    group by position_id, day
                ),
                day_wise_project_position as (
                    select
                        id,
                        generate_series(start_date, end_date, '1 day')::date as day,
                        coalesce(sum(utilization), 0) as total_util
                    from project_position
                    where start_date <= current_date and end_date >= current_date
                    group by id, day
                ),
                day_wise_utilization_diff as (
                    select
                        pos.id,
                        pos.day as day,
                        pos.total_util - coalesce(alloc.total_util, 0) as diff
                    from day_wise_project_position pos
                    left join day_wise_position_allocation alloc on pos.id=alloc.position_id and pos.day=alloc.day
                )
                select array_agg(distinct(util_diff.id))
                    from day_wise_utilization_diff util_diff
                    join project_position pos on pos.id = util_diff.id
                    where util_diff.diff > 0 and pos.project_role_id = project_role.id
                    group by project_role.id
            """

        project_roles = ProjectRole.objects.annotate(open_positions=RawSQL(query, params=[])
                                                     ).filter(open_positions__isnull=False).distinct()

        if project_id is not None:
            order_by += "role__name"
            project_roles = project_roles.filter(
                project__id=project_id).order_by(order_by)

        if role_id is not None:
            order_by += "project__name"
            project_roles = project_roles.filter(
                role__id=role_id).order_by(order_by)

        return project_roles

    def dashboard_industries(self, sort_asc=True):
        order_by = "name"
        if not sort_asc:
            order_by = "-" + order_by

        industries = Industry.objects.exclude(
            clients__isnull=True).order_by(order_by)
        return industries

    def dashboard_employee_industries_count(self, sort_asc=True):
        order_by = "name"
        if not sort_asc:
            order_by = "-" + order_by

        user_industries = Industry.objects.filter(
            user__status='Active').exclude(user__isnull=True).order_by(order_by)
        return user_industries
