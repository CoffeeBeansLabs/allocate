from django.core.management import BaseCommand

from user.models import Role

ROLES = ['Account Manager', 'Admin', 'Backend', 'BA', 'Content Writer', 'Data Engineer', 'Designer', 'Data Scientist',
         'DevOps', 'Finance', 'Frontend', 'Full Stack', 'Marketing', 'Operations', 'Human Resources', 'People',
         'Product Owner', 'Project Manager', 'QA', 'Recruitment', 'Sales', 'Solution Architect', 'Tech Lead',
         'SQL/Tableau Engg']


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--create', action='store_true', required=True)

    def handle(self, *args, **options):
        if options['create']:
            self.create_roles()

    def create_roles(self):
        roles = [Role(name=role_name) for role_name in ROLES]
        Role.objects.bulk_create(roles, ignore_conflicts=True)
