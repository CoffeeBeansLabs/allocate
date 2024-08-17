from datetime import datetime

from django.core.management import BaseCommand

from client.models import Client

import os
import requests


class Command(BaseCommand):

    def __init__(self):
        super().__init__()
        self.API_KEY = os.getenv('AIRTABLE_API_KEY')
        self.CLIENT_URL = 'https://api.airtable.com/v0/appHSNM3uycFJuElw/Current%20Projects'

    def handle(self, *args, **options):
        print('Importing client data...')
        self.import_client_data()
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

    def import_client_data(self):
        clients_data = self.get_data(self.CLIENT_URL)
        for client_data in clients_data:
            client_data = client_data['fields']
            status = client_data['Current Status'][0]
            if status != 'Active':
                continue

            name = client_data['Client Name']
            city = client_data['Client City']
            country = client_data['Client Country']
            start_date = client_data['Start date']
            client = Client.objects.filter(name=name).first()
            if client:
                start_date = min(datetime.strptime(start_date, '%Y-%m-%d').date(), client.start_date)

            Client.objects.update_or_create(
                name=name,
                defaults={
                    'status': Client.Status.ACTIVE,
                    'start_date': start_date,
                    'country': country,
                    'city': city
                })
