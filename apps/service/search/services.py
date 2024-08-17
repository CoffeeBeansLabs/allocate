from django.db.models import IntegerField, Count, FloatField
from django.db.models import Sum, Q
from django.db.models.expressions import RawSQL, F, Subquery, OuterRef, Case, When, Value
from django.db.models.functions import Coalesce, ExtractDay, Cast, Concat
from django.utils import timezone

from client.models import Client
from project.models import Project
from search.constants import Weights
from user.models import User


class SearchTalentService:
    def query_talents(self, role, skill_ids, search, locations, related_suggestions=False, projects=None):
        """
        Method to query and filter talents based on given criteria.
        """
        # query active users
        users = User.objects.filter_active()

        # filter based on role
        if role:
            if related_suggestions:
                # related searches => users that don't belong to given role but match other criteria
                users = users.exclude(role=role)
            else:
                users = users.filter(role=role)

        # filter based on search criteria
        if search:
            users = users.annotate(name=Concat('first_name', Value(' '), 'last_name')).filter(name__icontains=search)

        # filter based on required skills
        users = users.filter(proficiency_mapping__skill__in=skill_ids).distinct()

        # filter based on projects
        if projects:
            users = users.filter(allocation__position__project_role__project__in=projects)

        # filter based on locations
        if locations:
            location_filters = Q()
            for location in locations:
                location_filters |= Q(work_location__iexact=location)
            users = users.filter(location_filters)

        return users

    def score_talents(self, users, start_date, end_date, utilization, skill_ids, experience_start,
                      experience_end):
        """
        Method to score talents based on given criteria.
        """
        # score talents based on different parameters
        weight_availability = Weights.AVAILABILITY
        availability_score = 0
        if start_date and end_date and utilization:
            users = self.score_on_availability(users, start_date, end_date, utilization)
            availability_score = F('availability_score') * weight_availability
        else:
            weight_availability = 0

        users = self.score_on_skill_set(users, skill_ids)
        users = self.score_on_proficiency(users, skill_ids)

        experience_score = 0
        weight_experience = Weights.EXPERIENCE
        if experience_start and experience_end:
            users = self.score_on_experience(users, experience_start, experience_end)
            experience_score = F('experience_score') * weight_experience
        else:
            weight_experience = 0

        # calculate individual weighted score
        skill_score = F('skill_score') * Weights.SKILL
        proficiency_score = F('proficiency_score') * Weights.PROFICIENCY

        # calculate total score and order by the same
        weighted_score = availability_score + skill_score + proficiency_score + experience_score
        total_weight = weight_availability + Weights.SKILL + Weights.PROFICIENCY + weight_experience
        users = users.annotate(score=Cast(weighted_score / total_weight * 100, IntegerField()))
        users = users.order_by('-score')
        return users

    def score_on_availability(self, users, start_date, end_date, utilization):
        # logic -
        # score = number of days available / number of days required
        # max score = 1

        # calculate total number of days a user is available
        # in given start_date - end date range
        # for at least given utilization percentage i.e. availability >= utilization requirement

        # 'day_wise_allocation' CTE splits the user allocation data into individual days
        #   and calculates total utilization of each user per day
        # this is joined with the required date range in 'project_based_availability' CTE
        # 'available' column denotes whether user is available on that day for given utilization requirement
        # (value: 1 or 0)
        # same logic is applied for leave plan
        # if user is available as per both conditions and current day is not beyond LWD -
        # user is considered available for that day

        total_days = (end_date - start_date).days + 1
        query = """
            with
            day_wise_allocation as (
                select
                    user_id,
                    generate_series(start_date, coalesce(end_date, date %s), '1 day')::date as day,
                    sum(utilization) as util
                from project_allocation
                where tentative = false
                group by user_id, day
            ),
            day_wise_leaves as (
                select
                    user_id,
                    generate_series(from_date, to_date, '1 day'):: date as day
                from leave_plans
                where approval_status != 'Cancelled' and approval_status != 'Rejected'
                group by user_id, day
            ),
            project_based_availability as (
                select
                    u.id as uid,
                    s.day as day,
                    case when 100 - coalesce(a.util, 0) >= %s then 1 else 0 end as available
                from users u
                    left join (select id, generate_series(date %s, date %s, '1 day')::date as day from users) as s on
                    u.id=s.id
                    left join day_wise_allocation a on u.id=a.user_id and s.day=a.day
            ),
            leave_based_availability as (
                select
                    u.id as uid,
                    s.day as day,
                    case when l.day is null then 1 else 0 end as available
                from users u
                    left join (select id, generate_series(date %s, date %s, '1 day')::date as day from users) as s on
                    u.id=s.id
                    left join day_wise_leaves l on u.id=l.user_id and s.day=l.day
            )
            select
                sum((pba.available = 1 and lba.available = 1
                    and (users.last_working_day is null or pba.day < users.last_working_day))::int) as available_days
            from project_based_availability pba join leave_based_availability lba on pba.uid=lba.uid and pba.day=lba.day
            where pba.uid=users.id
            group by pba.uid
            """

        users = users.annotate(available_days=RawSQL(query,
                                                     params=[end_date, utilization, start_date, end_date, start_date,
                                                             end_date],
                                                     output_field=IntegerField()))
        users = users.annotate(availability_score=F('available_days') / float(total_days))
        return users

    def score_on_skill_set(self, users, skill_ids):
        # logic -
        # score = number of given skills the user has / number of skills required
        # max score = 1

        # calculate the number of 'given' skills for each user (rating > 0)
        # first filter the given skills and then count them
        #   (i.e. filter out the other skills the user has but are not required as per request)

        subquery = Subquery(
            User.objects.filter(id=OuterRef('id'))
            .filter(proficiency_mapping__skill__in=skill_ids, proficiency_mapping__rating__gt=0)
            .annotate(skill_count=Count('proficiency_mapping__skill')).values('skill_count')
        )
        users = users.annotate(skill_count=subquery)
        users = users.annotate(skill_score=Coalesce('skill_count', 0) / float(len(skill_ids)))
        return users

    def score_on_proficiency(self, users, skill_ids):
        # logic -
        # score = sum of proficiency rating for given skills / sum of max rating for those skills
        #   (For the scale 0 to 5 - rating above 4 is considered as 4 => max score is 4)
        # max score = 1

        # calculate the sum of rating for 'given' skills for each user (rating > 4 = 4)
        # first filter the given skills and then add the rating
        #   (i.e. filter out the other skills the user has but are not required as per request)

        subquery = Subquery(
            User.objects.filter(id=OuterRef('id')).filter(proficiency_mapping__skill__in=skill_ids)
            .annotate(rating_=Case(
                When(proficiency_mapping__rating__gte=4, then=4),
                default=F('proficiency_mapping__rating'),
                output_field=IntegerField()
            ))
            .annotate(proficiency_sum=Sum('rating_')).values('proficiency_sum'))
        users = users.annotate(proficiency_sum=subquery)
        users = users.annotate(proficiency_score=Coalesce('proficiency_sum', 0) / (len(skill_ids) * 4.0))
        return users

    def score_on_experience(self, users, experience_start, experience_end):
        # logic - score = 1 if user experience is in given range, 0.5 if user experience is +/- 4 years from given
        # range, else 0.25 max score = 1

        start_range = experience_start * 365
        end_range = experience_end * 365
        buffer1 = 1 * 365
        buffer2 = 3 * 365
        users = users.annotate(experience_days=Coalesce(
            ExtractDay(timezone.now().date() - F('career_start_date')) - (F('career_break_months') * 30), 0)
        )
        users = users.annotate(experience_score=Case(
            When(experience_days__range=[start_range, end_range], then=1),
            When(experience_days__range=[start_range - buffer1, end_range + buffer1], then=0.75),
            When(experience_days__range=[start_range - buffer2, end_range + buffer2], then=0.5),
            default=Value(0.25),
            output_field=FloatField()
        ))
        return users

    def query_users(self, search):
        users = User.objects.annotate(name=Concat('first_name', Value(' '), 'last_name')).filter(name__icontains=search)

        return users

    def query_client(self, search):
        clients = Client.objects.filter(name__icontains=search)
        return clients

    def query_project(self, search):
        projects = Project.objects.filter(name__icontains=search)

        return projects
