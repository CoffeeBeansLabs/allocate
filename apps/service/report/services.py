from datetime import date
from client.models import Client
from project.models import ProjectAllocation, ProjectPosition
from user.models import User
from user.services import list_cafe_users
from user.constants import CurrentStatusKeys


class ReportService:

    def report_cafe_users(self, start_date, end_date):
        cafe_users = list_cafe_users(start_date, end_date)

        excluded_statuses = [CurrentStatusKeys.MATERNITY_BREAK, CurrentStatusKeys.ADOPTION_LEAVE,
                             CurrentStatusKeys.SABBATICAL, CurrentStatusKeys.PATERNITY_BREAK]
        users = cafe_users.exclude(current_status__in=excluded_statuses) \
            .order_by('first_name')

        return users

    def report_potential_cafe_users(self):
        return list_cafe_users().filter(current_status=CurrentStatusKeys.FULLY_ALLOCATED).order_by('first_name')

    def report_location_users(self, locations):
        users = User.objects.filter(status='Active', location__in=locations).order_by(
            'location', 'first_name')

        return users

    def report_last_working_day_users(self, start_date, end_date):
        users = User.objects.filter(last_working_day__gte=start_date,
                                    last_working_day__lte=end_date).order_by('-last_working_day')

        return users

    def report_client_users(self, start_date, end_date):
        clients = Client.objects.filter(
            start_date__gte=start_date, start_date__lte=end_date)
        project_positions = ProjectPosition.objects.filter(
            project_role__project__client__in=clients)
        project_allocation_user_ids = list(
            ProjectAllocation.objects.filter(position_id__in=project_positions).values_list('user_id', flat=True))

        users = User.objects.filter(
            status='Active', id__in=project_allocation_user_ids).order_by('first_name')

        return users

    def report_anniversary_users(self):
        today = date.today()

        def next_anniversary(anniversary):
            if anniversary is None:
                return date.max
            next_anniversary = anniversary.replace(year=today.year)
            if next_anniversary <= today:
                next_anniversary = next_anniversary.replace(
                    year=today.year + 1)
            return next_anniversary

        users = User.objects.filter(status='Active')
        sorted_users = sorted(users, key=lambda x: (
            next_anniversary(x.anniversary)))

        return sorted_users
