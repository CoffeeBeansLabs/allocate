import requests
import os
import csv

from django.core.management import BaseCommand

from project.models import Project, ProjectPOC, ProjectPosition, ProjectAllocation, ProjectRole, ProjectPositionHistory
from client.models import Client
from staffing_tool.settings.base import BASE_DIR
from user.models import User


class Command(BaseCommand):
    def __init__(self):
        super().__init__()
        self.API_KEY = os.getenv('AIRTABLE_API_KEY')
        self.PROJECT_URL = 'https://api.airtable.com/v0/appHSNM3uycFJuElw/Current%20Projects'
        self.PATH = BASE_DIR / 'staffing_tool_utilization.csv'
        self.USER_DATA_URL = 'https://api.airtable.com/v0/appHSNM3uycFJuElw/Active%20Staffing'

    def handle(self, *args, **options):
        print('Importing project data...')
        self.import_project_data()
        print('Importing allocation data...')
        self.import_allocation_data()
        print('Imported successfully')

    def get_data(self, url):
        offset = ''
        users_data = []
        while True:
            params = {'offset': offset}
            headers = {'Authorization': self.API_KEY}
            try:
                response = requests.get(url, headers=headers, params=params)
                response_table = response.json()
                records = response_table['records']
                users_data.extend(records)
                try:
                    offset = response_table['offset']
                except Exception:
                    break
            except ValueError as value_error:
                print(value_error)
        return users_data

    def import_project_data(self):
        delivery_mode_map = {
            'On-Site': Project.DeliveryMode.ONSITE,
            'Hybrid': Project.DeliveryMode.HYBRID,
            'Remote': Project.DeliveryMode.REMOTE
        }
        projects_data = self.get_data(self.PROJECT_URL)
        poc_list = []
        for project_data in projects_data:
            project_data = project_data['fields']
            status = project_data['Current Status'][0]
            if status != 'Active':
                continue

            city = project_data['Project City']
            country = project_data['Project Country']
            start_date = project_data['Start date']
            delivery_mode = delivery_mode_map.get(project_data.get('Delivery Mode', {}))
            client = Client.objects.filter(name=project_data['Client Name']).first()

            project = Project.objects.update_or_create(
                name=project_data['Project Name'],
                defaults={
                    'status': Project.Status.ACTIVE,
                    'country': country,
                    'city': city,
                    'start_date': start_date,
                    'delivery_mode': delivery_mode,
                    'client': client
                })

            if project_data.get('SPOC 1'):
                poc_data = dict(name=project_data.get('SPOC 1'), email=project_data.get('SPOC 1 - Email'),
                                phone_number=project_data.get('SPOC 1 - Contact Details'), project=project[0])
                if not ProjectPOC.objects.filter(**poc_data).exists():
                    poc_list.append(ProjectPOC(**poc_data))
            if project_data.get('SPOC 2'):
                poc_data = dict(name=project_data.get('SPOC 2'), email=project_data.get('SPOC 2 - Email'),
                                phone_number=project_data.get('SPOC 2 - Contact Details'), project=project[0])
                if not ProjectPOC.objects.filter(**poc_data).exists():
                    poc_list.append(ProjectPOC(**poc_data))

        ProjectPOC.objects.bulk_create(poc_list)

    def import_allocation_data(self):
        date_dict = self.get_date_dict()
        with open(self.PATH, 'r') as csv_file:
            reader = csv.reader(csv_file)
            for row in list(reader)[4:]:
                user = User.objects.filter(employee_id=row[1]).first()

                if user is None:
                    continue
                project = Project.objects.filter(name__iexact=row[4]).first()
                if project is None:
                    continue
                role = user.role
                start_date = date_dict[int(row[1])]['start_date']
                end_date = date_dict[int(row[1])]['end_date']
                experience_range_start = date_dict[int(row[1])]['experience_range_start']
                experience_range_end = date_dict[int(row[1])]['experience_range_end']
                utilization = int(row[5].replace('%', ''))
                project_role, _ = ProjectRole.objects.get_or_create(project=project, role=role)

                project_position = ProjectPosition.objects.create(project_role=project_role,
                                                                  start_date=start_date,
                                                                  end_date=end_date,
                                                                  utilization=utilization,
                                                                  experience_range_start=experience_range_start,
                                                                  experience_range_end=experience_range_end)

                ProjectPositionHistory.objects.create(position=project_position,
                                                      utilization=utilization,
                                                      start_date=start_date,
                                                      end_date=end_date,
                                                      created_time=project_position.created_time,
                                                      modified_time=project_position.modified_time)

                ProjectAllocation.objects.create(user=user,
                                                 position=project_position,
                                                 utilization=utilization,
                                                 start_date=start_date,
                                                 end_date=end_date)

    def get_date_dict(self):
        users_data = self.get_data(self.USER_DATA_URL)
        date_dict = {}
        for user_data in users_data:
            user_data = user_data['fields']
            employee_id = user_data.get('Employee ID')
            if not employee_id:
                continue
            if isinstance(user_data['Exp Bucket'], str):
                experience_range = user_data['Exp Bucket'].replace('yrs', '')
                experience_range = experience_range.strip()
                if experience_range == '>12':
                    experience_range = '12-20'
                experience_range = experience_range.split('-')
                date_dict[employee_id] = {'start_date': user_data.get('Starting date'),
                                          'end_date': user_data.get('Tentative relieving date'),
                                          'experience_range_start': int(experience_range[0]),
                                          'experience_range_end': int(experience_range[1])}
        return date_dict
