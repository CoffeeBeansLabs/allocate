import logging
import datetime

from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from report.serializers import json_to_csv
from user.constants import PermissionKeys
from user.models import User, Role
from client.models import Client
from project.models import Project, ProjectAllocation, ProjectPosition, ProjectRole
from utils.permissions import get_permission_object


class BaseTestCase(APITestCase):
    user = None

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        logging.disable(logging.CRITICAL)

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(employee_id=1, email='user@company.io', first_name='Foo', last_name='Bar',
                                            status='Active', current_status='Fully_Allocated')


class ReportAPIViewTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.USER_DETAIL_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)
        today = datetime.date.today()
        position_allocation_start_date = today - datetime.timedelta(days=15)
        cls.client = Client.objects.create(name='Test', city='Bangalore', country='India', start_date='2020-01-10',
                                           account_manager=cls.user, status=Client.Status.ACTIVE)
        cls.project = Project.objects.create(name='Junk 1', status=Project.Status.ACTIVE, city='Bangalore',
                                             country='India', client=cls.client, start_date='2020-01-01')
        role, _ = Role.objects.get_or_create(name='Test Role')
        project_role = ProjectRole.objects.create(
            project=cls.project, role=role)
        cls.position = ProjectPosition.objects.create(
            project_role=project_role, utilization=60, experience_range_start=1, experience_range_end=3,
            start_date=position_allocation_start_date, end_date=today +
            datetime.timedelta(days=75)
        )

        ProjectAllocation.objects.update_or_create(user=cls.user, position=cls.position, utilization=50,
                                                   start_date=position_allocation_start_date, end_date=today +
                                                   datetime.timedelta(days=15),
                                                   kt_period=0)
        ProjectAllocation.objects.update_or_create(user=cls.user, position=cls.position, utilization=10,
                                                   start_date=today +
                                                   datetime.timedelta(days=15), end_date=today +
                                                   datetime.timedelta(days=50),
                                                   kt_period=0)
        cls.user1 = User.objects.create_user(
            employee_id=2, email='user1@company.io', first_name='John', last_name='Doe',
            status='Active', current_status='Cafe')

    def test_report_cafe_api_view(self):
        self.client.force_authenticate(user=self.user)
        test_cases = [
            {
                'data': {'startDate': datetime.date.today() - datetime.timedelta(days=10),
                         'endDate': datetime.date.today() + datetime.timedelta(days=40)},
                'expected_status': status.HTTP_200_OK
            },
            {
                'data': {'startDate': ' ', 'endDate': ' '},
                'expected_status': status.HTTP_400_BAD_REQUEST
            },
            {
                'data': {},
                'expected_status': status.HTTP_400_BAD_REQUEST
            }
        ]

        for test_case in test_cases:
            response = self.client.get('/api/v1/report/cafe/', test_case['data'],
                                       format='json')

            self.assertEqual(response.status_code,
                             test_case['expected_status'])
            if (test_case['expected_status'] == status.HTTP_200_OK):
                expected_content = (
                    'name,client,project,role,function,current_status,skill,total_experience_months,'
                    'date_of_joining,last_working_day,utilization,experience_bucket,cb_profile_link\r\n'
                    'Foo Bar,"Test, ","Junk 1, ",,,Fully_Allocated,,0,,,50,0–2,\r\n'
                    'John Doe,,,,,Cafe,,0,,,0,0–2,\r\n')
                self.assertEqual(response['Content-Type'], 'text/csv')
                self.assertEqual(response.content.decode(), expected_content)

    def test_report_Potential_cafe_api_view(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(
            '/api/v1/report/potential_cafe/', format='json')

        expected_content = ('name,client,project,role,function,current_status,skill,total_experience_months,'
                            'date_of_joining,last_working_day,employee_type,experience_bucket,cb_profile_link\r\n'
                            'Foo Bar,"Test, ","Junk 1, ",,,Fully_Allocated,,0,,,,0–2,\r\n')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertEqual(response.content.decode(), expected_content)

    def test_report_location_api_view(self):
        self.client.force_authenticate(user=self.user)
        test_cases = [
            {
                'data': {'location': 'Bangalore'},
                'expected_status': status.HTTP_200_OK

            },
            {
                'data': {},
                'expected_status': status.HTTP_400_BAD_REQUEST

            },
            {
                'data': {'location': ''},
                'expected_status': status.HTTP_400_BAD_REQUEST

            }
        ]

        for test_case in test_cases:
            response = self.client.get('/api/v1/report/location/', test_case['data'],
                                       format='json')

            self.assertEqual(response.status_code,
                             test_case['expected_status'])

    def test_report_lat_working_day_api_view(self):
        self.client.force_authenticate(user=self.user)
        test_cases = [
            {
                'data': {'startDate': '2023-01-01', 'endDate': '2023-01-31'},
                'expected_status': status.HTTP_200_OK
            },
            {
                'data': {'startDate': ' ', 'endDate': ' '},
                'expected_status': status.HTTP_400_BAD_REQUEST
            },
            {
                'data': {},
                'expected_status': status.HTTP_400_BAD_REQUEST
            }
        ]

        for test_case in test_cases:
            response = self.client.get('/api/v1/report/last_working_day/', test_case['data'],
                                       format='json')

            self.assertEqual(response.status_code,
                             test_case['expected_status'])

    def test_report_client_api_view(self):
        self.client.force_authenticate(user=self.user)
        test_cases = [
            {
                'data': {'startDate': '2023-01-01', 'endDate': '2023-01-31'},
                'expected_status': status.HTTP_200_OK
            },
            {
                'data': {'startDate': ' ', 'endDate': ' '},
                'expected_status': status.HTTP_400_BAD_REQUEST
            },
            {
                'data': {},
                'expected_status': status.HTTP_400_BAD_REQUEST
            }
        ]

        for test_case in test_cases:
            response = self.client.get('/api/v1/report/client/', test_case['data'],
                                       format='json')

            self.assertEqual(response.status_code,
                             test_case['expected_status'])

    def test_report_anniversary_api_view(self):
        self.client.force_authenticate(user=self.user)

        url = reverse('v1:report:anniversary_reports')
        response = self.client.get(url, format='json')
        expected_content = (
            'employee_id,name,years_at_company,total_experience_years,date_of_joining,is_lwd_before,anniversary,gender,'
            'function\r\n1,Foo Bar,0 years 0 months,0 years 0 months,,,,,\r\n'
            '2,John Doe,0 years 0 months,0 years 0 months,,,,,\r\n')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertEqual(response.content.decode(), expected_content)

    def test_json_to_csv(self):
        json_data = []
        response = json_to_csv(json_data)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertEqual(response['Content-Disposition'],
                         'attachment; filename="data.csv"')
        self.assertEqual(response.content.decode(), '\r\n')

        # Test case 2: JSON data with rows
        json_data = [
            {'name': 'John', 'age': 25},
            {'name': 'Alice', 'age': 30},
        ]
        response = json_to_csv(json_data)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertEqual(response['Content-Disposition'],
                         'attachment; filename="data.csv"')

        expected_content = 'name,age\r\nJohn,25\r\nAlice,30\r\n'
        self.assertEqual(response.content.decode(), expected_content)
