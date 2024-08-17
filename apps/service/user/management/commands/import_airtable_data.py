import os

import requests
from django.core.management.base import BaseCommand

from common.models import Industry, Skill
from user.models import User, ProficiencyMapping, Role


class Command(BaseCommand):

    def __init__(self):
        super().__init__()
        self.API_KEY = os.getenv('AIRTABLE_API_KEY')
        self.USER_DATA_URL = 'https://api.airtable.com/v0/appHSNM3uycFJuElw/Active%20Staffing'
        self.PROFICIENCY_MAPPING_URL = 'https://api.airtable.com/v0/appHSNM3uycFJuElw/Proficiency%20Mapping'
        self.INDUSTRY_EXPERIENCE_URL = 'https://api.airtable.com/v0/appHSNM3uycFJuElw/Industry%20Experience'
        self.EXPERIENCE_URL = 'https://api.airtable.com/v0/appHSNM3uycFJuElw/Experience'
        self.STAFFING_PROFILE_WITH_GA_PROFILE_LINK = 'https://api.airtable.com/v0/appFucZ1A6NSFU4xa/tbl72fFeTL7hGZnWX'

    def add_arguments(self, parser):
        parser.add_argument('--view', type=str)

    def handle(self, *args, **kwargs):
        view = kwargs['view']
        if view:
            view = view

        print('Importing user data...')
        self.set_user_data(view)
        print('Importing industry data...')
        self.set_industries(view)
        print('Importing proficiency data...')
        self.set_proficiency(view)
        print('Imported successfully')

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
        users_data = self.get_data(self.USER_DATA_URL, view)
        for user_data in users_data:
            user_data = user_data['fields']
            employee_id = user_data.get('Employee ID')
            if not employee_id:
                continue
            user = User.objects.filter(employee_id=employee_id).first()
            if not user:
                continue

            user.current_status = user_data.get('Current Status')
            user.primary_skill = user_data.get('Skill Set / Title')
            user.function = user_data.get('Function')[0] if user_data.get('Function') else None
            user.role = Role.objects.filter(name=user_data.get('Role / Function')).first()
            if view == 'LWD':
                user.last_working_day = user_data.get('Tentative relieving date')
            elif view == 'Ex-Employees':
                user.last_working_day = user_data.get('Tentative relieving date')
            user.save()
        view = None
        users_data = self.get_data(self.STAFFING_PROFILE_WITH_GA_PROFILE_LINK, view)

        for user_data in users_data:
            user_data = user_data['fields']
            employee_id = user_data.get('Employee ID (from Active Staffing)')
            if not employee_id:
                continue
            user = User.objects.filter(employee_id=employee_id).first()
            if not user:
                continue
            user.cb_profile_link = user_data.get('Profile links - CB')
            user.ga_profile_link = user_data.get('Profile links - GA')
            user.career_start_date = user_data.get('When did you start with your work Exp?')
            user.career_break_months = int(user_data.get('Career Break, if any,  in months?'))
            user.save()

    def set_industries(self, view):
        view = None
        industries_data = self.get_data(self.INDUSTRY_EXPERIENCE_URL, view)
        for industry_data in industries_data:
            industry_data = industry_data['fields']
            employee_id = industry_data.pop('Employee ID (from Active Staffing)', None)
            if not employee_id:
                continue
            user = User.objects.filter(employee_id=employee_id[0]).first()
            if not user:
                continue
            industries = Industry.objects.filter(name__in=industry_data.keys())
            user.industries.set(industries)

    def set_proficiency(self, view):
        view = None
        proficiencies_data = self.get_data(self.PROFICIENCY_MAPPING_URL, view)
        for proficiency_data in proficiencies_data:
            proficiency_data = proficiency_data['fields']
            employee_id = proficiency_data.pop('Employee ID (from Status)', None)
            if not employee_id:
                continue
            user = User.objects.filter(employee_id=employee_id[0]).first()
            if not user:
                continue
            for skill_name, rating in proficiency_data.items():
                skill = Skill.objects.filter(name=skill_name.strip()).first()
                if not skill:
                    continue
                ProficiencyMapping.objects.update_or_create(user=user, skill=skill,
                                                            defaults={'rating': int(float((rating.strip())))})
