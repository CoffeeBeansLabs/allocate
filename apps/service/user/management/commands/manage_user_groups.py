from django.contrib.auth.models import Group
from django.core.management import BaseCommand, CommandError

from authapp.constants import RoleKeys
from user.models import User


class Command(BaseCommand):
    def add_arguments(self, parser):
        group = parser.add_mutually_exclusive_group(required=True)
        group.add_argument('--create', action='store_true')
        group.add_argument('--delete', action='store_true')
        parser.add_argument('--email', type=str, required=True)
        parser.add_argument('--role', nargs='?', type=str, default=RoleKeys.SUPER_ADMIN)

    def handle(self, *args, **options):
        email = options['email']
        role = options['role']

        if email is None:
            raise CommandError("Email is required")

        try:
            group = Group.objects.get(name=role)
            user = User.objects.get(email=email)

            if options['delete']:
                self.remove_roles(user=user, group=group)
            else:
                self.assign_roles(user=user, group=group)
        except Exception as exc:
            raise CommandError(exc)

    def assign_roles(self, user, group):
        user.groups.clear()
        user_group = Group.objects.get(name=RoleKeys.USER)
        user.groups.add(user_group)
        user.groups.add(group)

        print('Role assigned successfully.')

    def remove_roles(self, user, group):
        user.groups.remove(group)

        print('Role removed successfully.')
