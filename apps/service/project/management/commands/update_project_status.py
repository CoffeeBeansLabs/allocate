import datetime

from django.core.management.base import BaseCommand
from utils.slack_message import send_slack_message
from project.models import Project
from project.constants import ErrorMessages


class Command(BaseCommand):
    def __init__(self):
        super().__init__()

    def handle(self, *args, **options):
        print("Updating Project Status....")
        self.update_status()
        print("Updated Project Status")

    def update_status(self):
        today = datetime.date.today()
        projects = Project.objects.filter(end_date__lt=today)

        for project in projects:
            project.status = 'CLOSED'
            account_manager_name = project.account_manager.full_name if project.account_manager \
                else ErrorMessages.NO_AM_ASSIGNED
            send_slack_message(f"Project: *{project.name}* was closed on _{datetime.date.today()}_\
                               \nClient: *{project.client.name}* \nAM: *{account_manager_name}*")
            project.save()
