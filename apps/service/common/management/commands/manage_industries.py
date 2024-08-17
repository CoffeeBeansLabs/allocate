from django.core.management import BaseCommand

from common.models import Industry

INDUSTRIES = ['AgriTech', 'Aviation', 'Biotechnology', 'Consulting', 'Entertainment', 'E-Commerce', 'Education',
              'Energy', 'FinTech',
              'Food Industry', 'Healthcare', 'Hospitality', 'Infrastructure', 'Learning & Development', 'Logistics',
              'Manufacturing', 'Marketing', 'Media', 'Mining', 'Pharma Industry', 'Pharmaceuticals', 'Real Estate',
              'Retail', 'Robotics', 'Sales', 'Software', 'Technology', 'Telecommunication', 'Textiles',
              'Transportation']


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--create', action='store_true', required=True)

    def handle(self, *args, **options):
        if options['create']:
            self.create_industries()

    def create_industries(self):
        industries = [Industry(name=industry_name) for industry_name in INDUSTRIES]
        Industry.objects.bulk_create(industries, ignore_conflicts=True)
