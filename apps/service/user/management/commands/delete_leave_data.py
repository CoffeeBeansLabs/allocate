from django.core.management.base import BaseCommand

from user.models import LeavePlans


class Command(BaseCommand):

    def handle(self, *args, **options):
        LeavePlans.objects.all().delete()
