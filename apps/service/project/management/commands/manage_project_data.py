import datetime
from django.core.management.base import BaseCommand
from django.db.models import Sum
from project.constants import SerializerKeys
from project.models import ProjectAllocation
from user.models import User
from user.constants import ValueConstants


def set_user_data():
    users_data = User.objects.all()
    for user in users_data:
        allocations = ProjectAllocation.objects.filter(user=user,
                                                       start_date__lte=datetime.date.today(),
                                                       end_date__gte=datetime.date.today())

        total_utilization = allocations.aggregate(Sum(SerializerKeys.UTILIZATION))[
            SerializerKeys.UTILIZATION_SUM]
        if not user:
            continue

        if not total_utilization:
            total_utilization = 0

        current_status = user.current_status

        if (ValueConstants.MAXIMUM_CAFE_UTILIZATION > total_utilization
            >= ValueConstants.MINIMUM_CAFE_UTILIZATION) and (
                user.status == 'Active'):
            current_status = 'Cafe'

        if user.last_working_day is not None:
            if user.last_working_day < datetime.date.today():
                current_status = 'Closed'

        user.current_status = current_status
        user.save()


class Command(BaseCommand):

    def __init__(self):
        super().__init__()

    def handle(self, *args, **kwargs):
        print('trying to do perform data cron')
        set_user_data()
        print('done')
