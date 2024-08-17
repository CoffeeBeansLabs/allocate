import os
from datetime import datetime, timedelta

import requests
from django.db.models import Q
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand
from django.utils import timezone
from geopy.geocoders import Nominatim

from user.constants import CurrentStatusKeys
from user.models import User, ZohoInformation, LeavePlans

DATE_FORMATTING = '%d-%b-%Y'


class Command(BaseCommand):

    def __init__(self):
        super().__init__()
        self.CLIENT_ID = os.getenv('ZOHO_CLIENT_ID')
        self.CLIENT_SECRET = os.getenv('ZOHO_CLIENT_SECRET')
        self.REFRESH_TOKEN = os.getenv('ZOHO_FORMS_REFRESH_TOKEN')

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int)

    def handle(self, *args, **options):
        days = options['days']
        from_timestamp = None
        if days:
            date = datetime.now().replace(hour=0, minute=0, second=0,
                                          microsecond=0) - timedelta(days=days)
            from_timestamp = int(date.timestamp() * 1000)
        access_token = self.get_token()

        print('Importing user data...')
        print('add/update user data...')
        self.import_users(access_token, from_timestamp)
        print('Importing leave plans...')
        self.import_leave_plans(access_token, from_timestamp)
        print('Imported successfully')

    def get_token(self):
        OAUTH_URL = 'https://accounts.zoho.in/oauth/v2/token'
        body = {
            'client_id': self.CLIENT_ID,
            'client_secret': self.CLIENT_SECRET,
            'refresh_token': self.REFRESH_TOKEN,
            'grant_type': 'refresh_token'
        }
        response = requests.post(OAUTH_URL, data=body)
        if not response.ok:
            print('Error obtaining authentication token')
            exit()
        try:
            parse_json = response.json()
            access_token = 'Bearer ' + parse_json['access_token']
        except KeyError:
            print('Error obtaining authentication token')
            exit()
        else:
            return access_token

    def get_user_data(self, access_token, modified_time=None):
        GET_RECORD_URL = 'https://people.zoho.in/people/api/forms/employee/getRecords'
        header = {'Authorization': access_token}
        params = {'sIndex': 1, 'limit': 200}
        if modified_time:
            params['modifiedtime'] = modified_time
        users_data = []
        while True:
            response = requests.get(
                GET_RECORD_URL, headers=header, params=params)
            if not response.ok:
                print('Error in getting user data from zoho')
                exit()
            try:
                parse_json = response.json()['response']
                if parse_json.get('errors'):
                    break
                users_data.extend(parse_json['result'])
            except KeyError:
                print('Error in getting user data from zoho')
                exit()
            params['sIndex'] += params['limit']
        return users_data

    def get_leave_plans(self, access_token, modified_time=None):
        GET_LEAVE_PLAN_URL = 'https://people.zoho.in/people/api/forms/P_ApplyLeaveView/records'
        header = {'Authorization': access_token}
        params = {'sIndex': 1, 'rec_limit': 200}
        if modified_time:
            params['modifiedtime'] = modified_time
        leaves_data = []
        while True:
            response = requests.get(
                GET_LEAVE_PLAN_URL, headers=header, params=params)
            if not response.ok:
                print('Error in getting leave data from zoho')
                exit()
            try:
                parse_json = response.json()
                if parse_json[0].get('errorcode'):
                    break
                leaves_data.extend(parse_json)
            except KeyError:
                print('Error in getting leave data from zoho')
                exit()
            params['sIndex'] += params['rec_limit']
        return leaves_data

    def parse_date_of_joining(self, date_of_joining):
        if not date_of_joining:
            return None
        return datetime.strptime(date_of_joining, DATE_FORMATTING).date()

    def create_user(self, user_data):
        work_location = user_data['Work_location']
        geolocator = Nominatim(user_agent="staffing tool")
        location = geolocator.geocode(work_location)
        user_group = Group.objects.get(name='user')
        country = 'India'
        if location is not None:
            country = location.raw['display_name'].split(',')[-1].strip()
        user = User.objects.create_user(
            employee_id=user_data['EmployeeID'],
            email=user_data['EmailID'],
            date_of_birth=self.parse_date_of_joining(
                user_data['Date_of_birth']),
            first_name=user_data['FirstName'],
            last_name=user_data['LastName'],
            phone_number=user_data['Work_phone'],
            date_of_joining=self.parse_date_of_joining(
                user_data['Dateofjoining']),
            work_location=work_location,
            country=country,
            status=user_data['Employeestatus'],
            current_status=CurrentStatusKeys.CAFE,
            employee_type=user_data['Employee_type'],
            location=user_data['LocationName'],
            is_active=user_data['Employeestatus'] == 'Active',
            designation=user_data['Designation'],
            gender=user_data['Gender']
        )
        user.groups.add(user_group)
        return user

    def update_user(self, user_data, user):
        work_location = user_data['Work_location']
        geolocator = Nominatim(user_agent="staffing tool")
        location = geolocator.geocode(work_location)
        user_group = Group.objects.get(name='user')
        country = ''
        if location is not None:
            country = location.raw['display_name'].split(',')[-1].strip()
        user.country = country
        user.email = user_data['EmailID']
        user.date_of_birth = self.parse_date_of_joining(
            user_data['Date_of_birth'])
        user.first_name = user_data['FirstName']
        user.last_name = user_data['LastName']
        user.phone_number = user_data['Mobile']
        user.date_of_joining = self.parse_date_of_joining(
            user_data['Dateofjoining'])
        if len(work_location) > 1:
            user.work_location = work_location
        if len(user_data['Employee_type']) > 1:
            user.employee_type = user_data['Employee_type']
        user.location = user_data['LocationName']
        if len(user_data['Gender']) > 1:
            user.gender = user_data['Gender']
        user.designation = user_data['Designation']
        user.groups.add(user_group)
        user.save()

    def set_zoho_information(self, user_data, user):
        tz = timezone.get_current_timezone()
        added_time = datetime.strptime(
            user_data['AddedTime'], '%d-%b-%Y %H:%M:%S')
        added_time = timezone.make_aware(added_time, tz, True)
        modified_time = datetime.fromtimestamp(
            int(user_data['ModifiedTime']) / 1000, tz=tz)
        created_time = datetime.fromtimestamp(
            int(user_data['CreatedTime']) / 1000, tz=tz)
        ZohoInformation.objects.update_or_create(
            user=user,
            defaults={
                'zoho_id': user_data['Zoho_ID'],
                'created_time': created_time,
                'added_time': added_time,
                'modified_time': modified_time
            })

    def set_user_manager(self, user_data):
        reporting_to = user_data['Reporting_To.MailID']
        if not reporting_to:
            return
        manager = User.objects.filter(email=reporting_to)
        if manager.count() > 1:
            return
        manager = manager.first()

        employee = User.objects.filter(
            Q(employee_id=user_data['EmployeeID']) | Q(email=user_data['EmailID']))
        if employee.count() > 1:
            return
        employee = employee.first()

        employee.reporting_to = manager
        employee.save()

    def set_leave_plans(self, leave_data):
        zoho_user = ZohoInformation.objects.filter(
            zoho_id=leave_data['ownerID']).first()
        if not zoho_user:
            print(f"Zoho ID {leave_data['ownerId']} not found")
            return
        from_date = datetime.strptime(
            leave_data['From'], DATE_FORMATTING).date()
        to_date = datetime.strptime(
            leave_data['To'], DATE_FORMATTING).date()
        LeavePlans.objects.update_or_create(
            record_id=leave_data['recordId'],
            defaults={
                'leave_type': leave_data['Leave Type'],
                'from_date': from_date,
                'to_date': to_date,
                'duration': leave_data['Days/Hours Taken'],
                'approval_status': leave_data['ApprovalStatus'],
                'user': zoho_user.user
            })

    def import_users(self, access_token, from_timestamp):
        users_data = self.get_user_data(access_token, from_timestamp)
        for user_data_map in users_data:
            user_data = user_data_map[list(user_data_map.keys())[0]][0]
            user = User.objects.filter(
                Q(employee_id=user_data['EmployeeID']) | Q(email=user_data['EmailID']))
            if user.count() > 1:
                continue

            user = user.first()
            if user:
                self.update_user(user_data, user)
            else:
                user = self.create_user(user_data)
            self.set_zoho_information(user_data, user)
        for user_data_map in users_data:
            user_data = user_data_map[list(user_data_map.keys())[0]][0]
            self.set_user_manager(user_data)

    def import_leave_plans(self, access_token, from_timestamp):
        leaves_data = self.get_leave_plans(access_token, from_timestamp)
        for leave_data in leaves_data:
            if 'ownerId' not in leave_data:
                continue

            if leave_data['Unit'] == 'Hours':
                print(f"Skipping record {leave_data['recordId']}: "
                      f"{leave_data['ownerName']} - {leave_data['Days/Hours Taken']} {leave_data['Unit']}")
                continue
            self.set_leave_plans(leave_data)
