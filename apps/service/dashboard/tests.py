import logging
import datetime

from user.constants import PermissionKeys, FunctionKeys
from user.models import User, Role, ProficiencyMapping, Skill
from client.models import Client
from project.models import Project, ProjectRole, ProjectPosition, ProjectAllocation
from dashboard.constant import ResponseKeys
from rest_framework.test import APITestCase
from rest_framework import status

from utils.permissions import get_permission_object


class BaseTestCase(APITestCase):
    user = None

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        logging.disable(logging.CRITICAL)

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            employee_id=1, email='user@company.io', first_name='Foo',
            last_name='Bar', status='Active', current_status='Fully_Allocated', function=FunctionKeys.DELIVERY)


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
            datetime.timedelta(days=75), is_billable=True
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
            employee_id=2, email='user1@company.io', first_name='Foo', last_name='Bar',
            status='Active', current_status='Cafe', function=FunctionKeys.DELIVERY)

        cls.skill1, _ = Skill.objects.get_or_create(name='Skill 1')
        cls.skill2, _ = Skill.objects.get_or_create(name='Skill 2')

        ProficiencyMapping.objects.create(
            user=cls.user, skill=cls.skill1, rating=2)
        ProficiencyMapping.objects.create(
            user=cls.user, skill=cls.skill2, rating=4)
        ProficiencyMapping.objects.create(
            user=cls.user1, skill=cls.skill1, rating=1)
        ProficiencyMapping.objects.create(
            user=cls.user1, skill=cls.skill2, rating=1)

    def test_employee_details_api_view(self):
        self.client.force_authenticate(user=self.user)
        test_cases = [
            {
                'data': {'skills_sort_ascending': True, 'project_id': 1},
                'expected_status': status.HTTP_200_OK
            },
            {
                'data': {'role_id': 1},
                'expected_status': status.HTTP_200_OK
            },
            {
                'data': {},
                'expected_status': status.HTTP_400_BAD_REQUEST
            },
            {
                'data': {'project_id': 1, 'role_id': 1},
                'expected_status': status.HTTP_400_BAD_REQUEST
            }
        ]

        for test_case in test_cases:
            response = self.client.get('/api/v1/dashboard/employees_detail/', test_case['data'],
                                       format='json')

            self.assertEqual(response.status_code,
                             test_case['expected_status'])
            if response.status_code == status.HTTP_200_OK:
                total_people = response.data["data"][ResponseKeys.EMPLOYEE_DATA]["total_people_count"]
                allocated_count = response.data["data"][ResponseKeys.EMPLOYEE_DATA]["allocated_people"]
                cafe_count = response.data["data"][ResponseKeys.EMPLOYEE_DATA]["cafe_people"]
                potential_cafe_count = response.data["data"][ResponseKeys.EMPLOYEE_DATA]["potential_cafe_people"]
                delivery_count = response.data["data"][ResponseKeys.EMPLOYEE_DATA]["delivery_people"]

                self.assertEqual(total_people, 2)
                self.assertEqual(allocated_count, 1)
                self.assertEqual(cafe_count, 1)
                self.assertEqual(potential_cafe_count, 1)
                self.assertEqual(delivery_count, 2)

    def test_current_allocation_api_view(self):
        self.client.force_authenticate(user=self.user)
        test_cases = [
            {
                'data': {'project_allocation_sort_ascending': True, 'role_breakup_sort_ascending': True,
                         'overall_skills_sort_ascending': True, 'project_id': 1},
                'expected_status': status.HTTP_200_OK
            },
            {
                'data': {'role_id': 1},
                'expected_status': status.HTTP_200_OK
            },
            {
                'data': {},
                'expected_status': status.HTTP_400_BAD_REQUEST
            },
            {
                'data': {'project_id': 1, 'role_id': 1},
                'expected_status': status.HTTP_400_BAD_REQUEST
            }
        ]

        for test_case in test_cases:
            response = self.client.get('/api/v1/dashboard/current_allocation/', test_case['data'],
                                       format='json')

            self.assertEqual(response.status_code,
                             test_case['expected_status'])

    def test_cafe_and_potential_api_view(self):
        self.client.force_authenticate(user=self.user)
        test_cases = [
            {
                'data': {'cafe_sort_ascending': True, 'potential_cafe_sort_ascending': True},
                'expected_status': status.HTTP_200_OK
            },
            {
                'data': {},
                'expected_status': status.HTTP_200_OK
            }
        ]

        for test_case in test_cases:
            response = self.client.get('/api/v1/dashboard/cafe_and_potential/', test_case['data'],
                                       format='json')

            self.assertEqual(response.status_code,
                             test_case['expected_status'])
            self.assertEqual(
                response.data['data'][ResponseKeys.CAFE_EMPLOYEE_SKILLS]['employee_skill_count'],
                {self.skill1.name: {1: 1}, self.skill2.name: {1: 1}})
            self.assertEqual(
                response.data['data'][ResponseKeys.POTENTIAL_CAFE_EMPLOYEE_SKILLS]['employee_skill_count'],
                {self.skill1.name: {2: 1}, self.skill2.name: {4: 1}})

    def test_people_api_view(self):
        self.client.force_authenticate(user=self.user)
        test_cases = [
            {
                'data': {'proficiency_sort_ascending': True, 'experience_sort_ascending': True,
                         'industries_sort_ascending': True},
                'expected_status': status.HTTP_200_OK
            },
            {
                'data': {},
                'expected_status': status.HTTP_200_OK
            }
        ]

        for test_case in test_cases:
            response = self.client.get('/api/v1/dashboard/people/', test_case['data'],
                                       format='json')

            self.assertEqual(response.status_code,
                             test_case['expected_status'])

    def test_client_and_project_api_view(self):
        self.client.force_authenticate(user=self.user)
        test_cases = [
            {
                'data': {'industries_sort_ascending': True, 'allocation_sort_ascending': True},
                'expected_status': status.HTTP_200_OK
            },
            {
                'data': {},
                'expected_status': status.HTTP_200_OK
            }
        ]

        for test_case in test_cases:
            response = self.client.get('/api/v1/dashboard/client_and_project/', test_case['data'],
                                       format='json')

            self.assertEqual(response.status_code,
                             test_case['expected_status'])
