import os

import requests
from django.core.management.base import BaseCommand

from user.models import User


class Command(BaseCommand):

    def __init__(self):
        super().__init__()
        self.API_KEY = os.getenv('AIRTABLE_API_KEY')
        self.STAFFING_PROFILE_WITH_GA_PROFILE_LINK = 'https://api.airtable.com/v0/appFucZ1A6NSFU4xa/tbl72fFeTL7hGZnWX'

    def add_arguments(self, parser):
        parser.add_argument('--view', type=str)

    def handle(self, *args, **kwargs):
        view = kwargs['view']
        if view:
            view = view

        print('Importing user data...')
        self.set_user_data(view)

    def get_data(self, url, view):
        offset = ''
        users_data = []
        while True:
            params = {'offset': offset, 'view': view}
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

    def set_user_data(self, view):
        users_data = self.get_data(self.STAFFING_PROFILE_WITH_GA_PROFILE_LINK, view)

        for user_data in users_data:
            user_data = user_data['fields']
            employee_id = user_data.get('Employee ID (from Active Staffing)')
            if not employee_id:
                continue
            user = User.objects.filter(employee_id=employee_id).first()
            if not user:
                continue
            print(f"Emp_ID: {employee_id} \n User Name: {user.first_name} {user.last_name} \n Career Start Date "
                  f"{user_data.get('When did you start with your work Exp?')} \n ")
            if user.career_start_date is None:
                continue
            user.career_start_date = user_data.get('When did you start with your work Exp?')
            user.career_break_months = int(user_data.get('Career Break, if any,  in months?'))
            user.save()
