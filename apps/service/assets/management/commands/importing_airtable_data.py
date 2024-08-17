import requests
import datetime
import os

from user.models import User
from django.core.management.base import BaseCommand
from assets.models import Inventory, InUseAsset
from django.utils.timezone import make_aware


class Command(BaseCommand):
    # to hold list of serial numbers and maintain uniqueness
    serial_numbers = []
    cb_asset_numbers = []
    cb_number = 1

    def __init__(self):
        super().__init__()
        self.API_KEY = os.environ.get('AIRTABLE_API_KEY')
        self.LAPTOP_INVOICES = 'https://api.airtable.com/v0/appwFnrZUpKWYK888/Laptop%20invoices'
        self.ASSETS = 'https://api.airtable.com/v0/appwFnrZUpKWYK888/Assets'
        self.CLIENT_ASSETS = 'https://api.airtable.com/v0/appwFnrZUpKWYK888/Client%20Assets'
        self.EMPLOYEE_DATA = 'https://api.airtable.com/v0/appwFnrZUpKWYK888/Employee%20data'

    def add_arguments(self, parser):
        parser.add_argument('--view', type=str)

    def handle(self, *args, **kwargs):
        view = kwargs['view']
        if view:
            view = view
        self.set_inventory(view)
        print('Importing inventory data...')
        self.set_inuseasset()
        print('Importing in use assets data...')

    def get_data(self, url, view):
        offset = ''
        users_data = []
        while True:
            params = {'offset': offset, 'view': view}
            headers = {'Authorization': self.API_KEY,
                       'Content-Type': 'application/json', }

            try:
                response = requests.get(url, headers=headers, params=params)
                response_table = response.json()
                records = response_table['records']
                users_data.extend(records)
                try:
                    offset = response_table['offset']
                except Exception as exc:
                    print("ERROR: ", exc)
                    break
            except ValueError as value_error:
                print(value_error)
        return users_data

    def set_userdata(self, view):
        # to add employee id's
        userdata = []
        users_data = self.get_data(self.EMPLOYEE_DATA, view)

        for user_data in users_data:
            user_data = user_data['fields']

            name = user_data.get('Name')
            id = user_data.get('Employee ID')
            userdata.append({'name': name, 'employee_id': id})

        return userdata

    def set_inventory(self, view):
        users_data = self.get_data(self.LAPTOP_INVOICES, view)
        for user_data in users_data:
            user_data = user_data['fields']
            serial = user_data.get('Serial number')
            self.serial_numbers.append(serial)

            model = user_data.get('Model')
            model = model.lower().strip()
            if model == 'legion' or model == 'lenovo thinkpad':
                brand = 'lenovo'
            elif model == 'macbook pro' or model == 'macbook air':
                brand = 'apple'
            elif model == 'hp pavilion':
                brand = 'hp'
            elif model == 'dell':
                brand = model
                model = None
            else:
                brand = model
                model = None

            if brand == 'lenovo':
                movar = 'L'
            elif brand == 'apple':
                movar = 'A'
            elif brand == 'hp':
                movar = 'HP'
            elif brand == 'dell':
                movar = 'D'
            else:
                movar = 'NA'

            owner = user_data.get('Ownership')
            if owner is not None:
                if owner != 'CB':
                    owner = 'LC'
            else:
                owner = 'NA'
            screen = user_data.get('Screen size')
            if screen is None:
                screen = 'NA'
            else:
                screen = str(user_data.get('Screen size'))[0:2]
            cb_asset_number = owner + 'LT' + movar + screen + '0001'

            if cb_asset_number not in self.cb_asset_numbers:
                self.cb_asset_numbers.append(cb_asset_number)
            else:
                while cb_asset_number in self.cb_asset_numbers:
                    self.cb_number += 1
                    cb_asset_number = owner + 'LT' + movar + screen + str(self.cb_number).zfill(4)
                self.cb_asset_numbers.append(cb_asset_number)
            self.cb_number = 1

            date_of_purchase = user_data.get('Date of purchase')
            if date_of_purchase is not None:
                date_of_purchase = datetime.datetime.strptime(date_of_purchase, '%Y-%m-%d')
                date_of_purchase = make_aware(date_of_purchase, timezone=None)

            owner = user_data.get('Ownership')
            if owner != 'CB' and owner != 'Client':
                lease = owner
                owner = 'Leasing'
            else:
                lease = None

            inventory = Inventory(
                date_of_purchase=date_of_purchase,
                cb_asset_id=cb_asset_number,
                brand=brand,
                model=model,
                type='Laptop',
                screensize=screen,
                serial_num=serial,
                year=user_data.get('Model year'),
                link_to_invoice=user_data.get('Invoice link'),
                comments=user_data.get('Remarks'),
                invoice_num=user_data.get('Invoice number'),
                amount=user_data.get('Amount'),
                gst=user_data.get('GST'),
                total_amt_paid=user_data.get('Total amount paid'),
                vendor=user_data.get('Vendor'),
                leasing_company=lease,
                ownership=owner,
            )
            inventory.save()

        print("INVENTORY SET")

    def set_inuseasset(self):
        sno = 1
        view = None
        users_data = self.get_data(self.ASSETS, view)
        # employee_data = self.set_userdata(view)

        inuseassets = list()

        for user_data in users_data:
            user_data = user_data['fields']
            emp_id = str(user_data.get('Employee ID'))
            assigned_user = User.objects.filter(employee_id=emp_id).first()
            model = user_data.get('Model')
            if model is not None:
                model = model.lower().strip()
                if model == 'legion' or model == 'lenovo thinkpad':
                    brand = 'lenovo'
                elif model == 'macbook pro' or model == 'macbook air':
                    brand = 'apple'
                elif model == 'hp pavilion':
                    brand = 'hp'
                elif model == 'dell':
                    brand = model
                    model = None
                else:
                    brand = model
                    model = None

            if brand == 'lenovo':
                movar = 'L'
            elif brand == 'apple':
                movar = 'A'
            elif brand == 'hp':
                movar = 'HP'
            elif brand == 'dell':
                movar = 'D'
            else:
                movar = 'NA'

            serial = user_data.get('Laptop serial number')

            screen = user_data.get('Screen size')
            if screen is None:
                screen = 'NA'
            else:
                screen = str(user_data.get('Screen size'))[0:2]

            cb_asset_number = 'CB' + 'LT' + movar + screen + '0001'

            if cb_asset_number not in self.cb_asset_numbers:
                self.cb_asset_numbers.append(cb_asset_number)
            else:
                while cb_asset_number in self.cb_asset_numbers:
                    self.cb_number += 1
                    cb_asset_number = 'CB' + 'LT' + movar + screen + str(self.cb_number).zfill(4)
                self.cb_asset_numbers.append(cb_asset_number)
            self.cb_number = 1

            # adding currently owned devices into inventory
            if serial not in self.serial_numbers:
                inventory = Inventory(
                    brand=brand,
                    model=model,
                    type='Laptop',
                    cb_asset_id=cb_asset_number,
                    screensize=screen,
                    serial_num=serial,
                    year=user_data.get('Year'),
                    ownership="CB",
                )
                self.serial_numbers.append(serial)
                inventory.save()

            status = user_data.get('Status')
            if serial is not None:
                changeid = user_data.get('Laptop serial number') + "*" + str(sno)
            else:
                print("Skipping asset. Serial Number not found.")
                continue

            if status == 'Written off - Sold to employee':
                status = 'WR'
            elif status == 'In repair':
                status = 'REP'
            elif status == 'Unassigned':
                status = 'INV'
            elif status == 'Assigned':
                status = 'ASSI'
            elif status == 'Allocated to another employee':
                status = 'ASSI'
            elif status == 'To be checked':
                status = 'TRAN'
            elif status == 'To be received by CB':
                status = 'TRAN'
            elif status == 'Not working':
                status = 'NW'

            if status == 'WR' or status == 'NW' or status == 'SL' or status == 'RC' or status == 'LC':
                closed = status
                active = None
            else:
                active = status
                closed = None

            date_of_change = user_data.get('Today\'s date')
            if date_of_change is not None:
                date_of_change = datetime.datetime.strptime(date_of_change, '%Y-%m-%d')
                date_of_change = make_aware(date_of_change, timezone=None)

            try:
                inuseassets.append(
                    InUseAsset(
                        change_id=changeid,
                        # assignee_id = assigneeid,
                        user=assigned_user,
                        inventory_id=serial,
                        other_assets=user_data.get('Other assets'),
                        comments=user_data.get('Comment'),
                        date_of_change=date_of_change,
                        location=user_data.get('Location'),
                        active=active,
                        closed=closed,
                    )
                )
            except Exception as exc:
                print("************************")
                print("DATA NOT SAVED!")
                print("************************")
                print("ERROR: ", exc)

            sno += 1

        InUseAsset.objects.bulk_create(inuseassets)

        view = None
        users_data = self.get_data(self.CLIENT_ASSETS, view)
        print("************CLIENT ASSETS************")

        for user_data in users_data:
            user_data = user_data['fields']
            if user_data.get('Employee ID (from Assets)'):
                emp_id = user_data.get('Employee ID (from Assets)')[0]
                assigned_user = User.objects.filter(employee_id=emp_id).first()
            else:
                assigned_user = None
            model = user_data.get('Model')
            if model is not None:
                model = model.lower().strip()
                models = model.split()
                if model == 'legion' or model == 'lenovo thinkpad':
                    brand = 'lenovo'
                elif model == 'macbook pro' or model == 'macbook air':
                    brand = 'apple'
                elif 'hp' in models and len(models) > 1:
                    brand = 'hp'
                elif 'dell' in models and len(models) > 1:
                    brand = 'dell'
                else:
                    brand = model
                    model = None

            if brand == 'lenovo':
                movar = 'L'
            elif brand == 'apple':
                movar = 'A'
            elif brand == 'hp':
                movar = 'HP'
            elif brand == 'dell':
                movar = 'D'
            else:
                movar = 'NA'

            '''for employee in employee_data:
                if named in employee:
                    assigneeid = employee[named]
                    break'''

            serial = user_data.get('Laptop serial number')
            screen = user_data.get('Screen size')
            if screen is None:
                screen = 'NA'
            else:
                screen = str(user_data.get('Screen size'))[0:2]

            cb_asset_number = 'CL' + 'LT' + movar + screen + '0001'

            if cb_asset_number not in self.cb_asset_numbers:
                self.cb_asset_numbers.append(cb_asset_number)
            else:
                while cb_asset_number in self.cb_asset_numbers:
                    self.cb_number += 1
                    cb_asset_number = 'CL' + 'LT' + movar + screen + str(self.cb_number).zfill(4)
                self.cb_asset_numbers.append(cb_asset_number)
            self.cb_number = 1

            # adding client owned devices into inventory
            if serial not in self.serial_numbers:
                inventory = Inventory(
                    brand=brand,
                    model=model,
                    type='Laptop',
                    cb_asset_id=cb_asset_number,
                    screensize=screen,
                    serial_num=serial,
                    year=user_data.get('Year'),
                    ownership="Client",
                )
                self.serial_numbers.append(serial)

            inventory.save()

            if serial is not None:
                changeid = user_data.get('Laptop serial number') + "*" + str(sno)
            else:
                print("Serial number not found. Skipping asset.")
                continue

            date_of_change = user_data.get('Today\'s date')
            if date_of_change is not None:
                date_of_change = datetime.datetime.strptime(date_of_change, '%Y-%m-%d')
                date_of_change = make_aware(date_of_change, timezone=None)

            inuseasset = InUseAsset(
                change_id=changeid,
                user=assigned_user,
                client=user_data.get('Client Name'),
                project=user_data.get('Project Name'),
                inventory_id=serial,
                other_assets=user_data.get('Other assets'),
                date_of_change=date_of_change,
                location=user_data.get('Location'),
                active="ASSI",
            )

            try:
                inuseasset.save()
            except Exception as exc:
                print("ERROR: ", exc)
            sno += 1

        print("IN USE ASSETS SET")
