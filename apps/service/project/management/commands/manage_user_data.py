import datetime

from django.core.management.base import BaseCommand
from django.db.models import Sum

from project.constants import SerializerKeys
from project.models import ProjectAllocation
from user.models import User, LeavePlans
from user.constants import ValueConstants


class Command(BaseCommand):

    def __init__(self):
        super().__init__()

    def handle(self, *args, **kwargs):
        print('Updating user data...')
        self.set_user_data()
        print('update successfully')

    def set_user_data(self):
        users_data = User.objects.all()
        current_date = datetime.date.today()
        for user in users_data:
            allocations = ProjectAllocation.objects.filter(user=user,
                                                           start_date__lte=current_date,
                                                           end_date__gte=current_date)
            total_utilization = allocations.aggregate(Sum(SerializerKeys.UTILIZATION))[
                SerializerKeys.UTILIZATION_SUM]

            if not user:
                continue

            if not total_utilization:
                total_utilization = 0

            user_leaves = LeavePlans.objects.filter(
                user=user, from_date__lte=current_date, to_date__gte=current_date)
            for i in user_leaves:
                if i.leave_type == 'Maternity Leave':
                    user.current_status = 'Maternity Break'
                elif i.leave_type == 'Adoption Leave':
                    user.current_status = 'Adoption Break'
                elif i.leave_type == 'Sabbatical Leave':
                    user.current_status = 'Sabbatical Break'
                elif i.leave_type == 'Paternity Leave':
                    user.current_status = 'Paternity Break'

            current_status = user.current_status
            status = user.status
            is_active = user.is_active

            if total_utilization >= ValueConstants.MAXIMUM_CAFE_UTILIZATION \
                    and user.status == 'Active' and user.current_status != 'Serving NP':
                current_status = 'Fully_Allocated'

            if (ValueConstants.MAXIMUM_CAFE_UTILIZATION > total_utilization
                >= ValueConstants.MINIMUM_CAFE_UTILIZATION) and (
                user.status == 'Active') and (
                    user.current_status != 'Maternity Break' and user.current_status !=
                    'Sabbatical' and user.current_status != 'Adoption Leave' and user.current_status !=
                    'Paternity Break' and user.current_status != 'Serving NP'):
                current_status = 'Cafe'

            if user.last_working_day and user.last_working_day < datetime.date.today():
                current_status = 'Closed'
                status = 'Closed'
                is_active = False

            user.current_status = current_status
            user.status = status
            user.is_active = is_active
            user.save()
