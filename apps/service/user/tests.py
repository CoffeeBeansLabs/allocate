import logging
from datetime import datetime

from django.contrib.auth.models import Group
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from client.models import Client
from common.models import Skill, Industry
from project.models import Project, ProjectRole, ProjectPosition, ProjectAllocation
from user.constants import PermissionKeys, ResponseKeys, ErrorMessages
from user.models import Role, ProficiencyMapping
from user.models import User  # Import your User model here
from utils.permissions import get_permission_object


class BaseTestCase(APITestCase):
    user = None

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        logging.disable(logging.CRITICAL)

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(employee_id="1", email='user@company.io', first_name='Foo', last_name='Bar',
                                            status='Active')


class CreateUserRoleTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(PermissionKeys.USER_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

    def test_add_role(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:create_role')
        data = {
            'name': 'Test Role',
        }

        response = self.client.post(url, data, format='json')
        role = Role.objects.filter(name='Test Role').first()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data[ResponseKeys.NAME], role.name)


class UserTimelineTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(PermissionKeys.USER_DETAIL_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        cls.client_ = Client.objects.create(name='Test', city='Bangalore', country='India', start_date='2020-01-10',
                                            account_manager=cls.user)
        cls.project = Project.objects.create(name='Junk', status=Project.Status.ACTIVE, city='Bangalore',
                                             country='India', client=cls.client_, start_date='2020-01-01')

        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(project=cls.project, role=role)
        cls.position1 = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-04-01'
        )
        cls.position2 = ProjectPosition.objects.create(
            project_role=project_role, utilization=70, experience_range_start=5, experience_range_end=8,
            start_date='2023-06-01', end_date='2023-07-01'
        )

        cls.skill1, _ = Skill.objects.get_or_create(name='Python')
        cls.skill2, _ = Skill.objects.get_or_create(name='Java')

        cls.user1 = User.objects.create(employee_id=11, email='user1@company.io', first_name='Foo1', last_name='Bar1',
                                        career_start_date='2019-07-15', work_location='Bangalore')
        ProficiencyMapping.objects.create(user=cls.user1, skill=cls.skill1, rating=4)

        cls.user2 = User.objects.create(employee_id=12, email='user2@company.io', first_name='Foo2', last_name='Bar2',
                                        career_start_date='2015-01-01', designation="SDE L1", work_location='Hyderabad')
        ProficiencyMapping.objects.create(user=cls.user2, skill=cls.skill1, rating=2)
        ProficiencyMapping.objects.create(user=cls.user2, skill=cls.skill2, rating=4)

        cls.user3 = User.objects.create(employee_id=13, email='user3@company.io', first_name='Foo3', last_name='Bar3',
                                        is_active=False)

        ProjectAllocation.objects.create(user=cls.user1, position=cls.position1, utilization=50,
                                         start_date='2023-01-01', end_date='2023-03-31')
        ProjectAllocation.objects.create(user=cls.user1, position=cls.position2, utilization=70,
                                         start_date='2023-02-25', end_date='2023-03-31')
        ProjectAllocation.objects.create(user=cls.user2, position=cls.position2, utilization=70,
                                         start_date='2023-07-01', end_date='2023-07-31')

    def test_talent_timeline(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:list_users')
        data = {

        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.USERS][1][ResponseKeys.PROJECTS][0][ResponseKeys.PROJECT_NAME],
                         self.project.name)

    def test_search_by_project(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:list_users')
        data = {
            'project': [self.project.id]
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.USERS][1][ResponseKeys.PROJECTS][0][ResponseKeys.PROJECT_NAME],
                         self.project.name)
        self.assertEqual(response.data[ResponseKeys.USERS][0][ResponseKeys.PROJECTS][0][ResponseKeys.PROJECT_NAME],
                         self.project.name)

    def test_search_by_skills(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:list_users')
        data = {
            'skills': [self.skill1.id]
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.USERS][0][ResponseKeys.SKILLS][0][ResponseKeys.SKILL],
                         self.skill1.name)

    def test_search_by_experience(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:list_users')
        data = {
            "experience_range_start": 0,
            "experience_range_end": 2
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 2)

    def test_search_by_availability(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:list_users')
        data = {
            "availability": 50
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 4)

    def test_search_by_locations(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:list_users')
        data = {
            "locations": ['Hyderabad', 'bangalore']
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 2)

    def test_sort_by_experience_asc(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:list_users')
        data = {
            "sort_by": "experience_asc"
        }
        past_date = datetime.strptime("2015-01-01", "%Y-%m-%d")
        today = datetime.today()
        experience_months = (today.year - past_date.year) * 12 + today.month - past_date.month
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.USERS][3][ResponseKeys.EXPERIENCE_MONTHS], experience_months)

    def test_sort_by_experience_desc(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:list_users')
        data = {
            "sort_by": "experience_desc"
        }
        response = self.client.post(url, data, format='json')

        past_date = datetime.strptime("2015-01-01", "%Y-%m-%d")
        today = datetime.today()
        experience_months = (today.year - past_date.year) * 12 + today.month - past_date.month

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.USERS][0][ResponseKeys.EXPERIENCE_MONTHS], experience_months)

    def test_sort_by_availability_desc(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:list_users')
        data = {
            "sort_by": "availability_desc"
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.USERS][0][ResponseKeys.TOTAL_UTILIZED], 0)

    def test_sort_by_availability_asc(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:list_users')
        data = {
            "sort_by": "availability_asc"
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.USERS][0][ResponseKeys.TOTAL_UTILIZED], 0)

    def test_all_talent_timeline(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:list_users')
        data = {
            "sort_by": "availability_asc",
            "availability": 0,
            "experience_range_start": 0,
            "experience_range_end": 20,
            'skills': [self.skill1.id, self.skill2.id],
            "response_date_start": "2023-01-01",
            "response_date_end": "2023-07-01",
            "search": "Foo2 Bar2"

        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_search_talent_timeline(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:list_users')
        data = {
            "search": "Foo2 Bar2"
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.USERS][0]['full_name_with_exp_band'], 'Foo2 Bar2 - L1')


class UserDetailsTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(PermissionKeys.USER_DETAIL_PERMISSIONS[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)

        cls.client_ = Client.objects.create(name='Test', city='Bangalore', country='India', start_date='2020-01-10',
                                            account_manager=cls.user)
        cls.project = Project.objects.create(name='Junk', status=Project.Status.ACTIVE, city='Bangalore',
                                             country='India', client=cls.client_, start_date='2020-01-01')

        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(project=cls.project, role=role)
        cls.position1 = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-04-01'
        )
        cls.position2 = ProjectPosition.objects.create(
            project_role=project_role, utilization=70, experience_range_start=5, experience_range_end=8,
            start_date='2023-06-01', end_date='2023-07-01'
        )

        cls.skill1, _ = Skill.objects.get_or_create(name='Python')
        cls.skill2, _ = Skill.objects.get_or_create(name='Java')

        cls.user1 = User.objects.create(employee_id=11, email='user1@company.io', first_name='Foo1', last_name='Bar1',
                                        career_start_date='2019-07-15')
        ProficiencyMapping.objects.create(user=cls.user1, skill=cls.skill1, rating=4)

        cls.user2 = User.objects.create(employee_id=12, email='user2@company.io', first_name='Foo2', last_name='Bar2',
                                        career_start_date='2015-01-01')
        ProficiencyMapping.objects.create(user=cls.user2, skill=cls.skill1, rating=2)
        ProficiencyMapping.objects.create(user=cls.user2, skill=cls.skill2, rating=4)

        cls.user3 = User.objects.create(employee_id=13, email='user3@company.io', first_name='Foo3', last_name='Bar3',
                                        is_active=False)

        ProjectAllocation.objects.create(user=cls.user1, position=cls.position1, utilization=50,
                                         start_date='2023-01-01', end_date='2023-03-31')
        ProjectAllocation.objects.create(user=cls.user1, position=cls.position2, utilization=70,
                                         start_date='2023-02-25', end_date='2023-03-31')
        ProjectAllocation.objects.create(user=cls.user2, position=cls.position2, utilization=70,
                                         start_date='2023-07-01', end_date='2023-07-31')

    def test_talent_details(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_details', kwargs={'user_id': self.user1.id})

        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.USER]['id'], self.user1.id)

    def test_talent_invalid_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_details', kwargs={'user_id': 1145})
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], ErrorMessages.USER_DOES_NOT_EXIST)


class UserSkillIndustryDetailsTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(PermissionKeys.INDUSTRY_PROFICIENCY_PERMISSION[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)
        permission = get_permission_object(PermissionKeys.INDUSTRY_PROFICIENCY_PERMISSION[PermissionKeys.GET][1])
        cls.user.user_permissions.add(permission)

        cls.client_ = Client.objects.create(name='Test', city='Bangalore', country='India', start_date='2020-01-10',
                                            account_manager=cls.user)
        cls.project = Project.objects.create(name='Junk', status=Project.Status.ACTIVE, city='Bangalore',
                                             country='India', client=cls.client_, start_date='2020-01-01')

        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(project=cls.project, role=role)
        cls.position1 = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-04-01'
        )
        cls.position2 = ProjectPosition.objects.create(
            project_role=project_role, utilization=70, experience_range_start=5, experience_range_end=8,
            start_date='2023-06-01', end_date='2023-07-01'
        )

        cls.skill1, _ = Skill.objects.get_or_create(name='Python')
        cls.skill2, _ = Skill.objects.get_or_create(name='Java')

        cls.user1 = User.objects.create(employee_id=11, email='user1@company.io', first_name='Foo1', last_name='Bar1',
                                        career_start_date='2019-07-15')
        ProficiencyMapping.objects.create(user=cls.user1, skill=cls.skill1, rating=4)

        cls.user2 = User.objects.create(employee_id=12, email='user2@company.io', first_name='Foo2', last_name='Bar2',
                                        career_start_date='2015-01-01')
        ProficiencyMapping.objects.create(user=cls.user2, skill=cls.skill1, rating=2)
        ProficiencyMapping.objects.create(user=cls.user2, skill=cls.skill2, rating=4)

        cls.user3 = User.objects.create(employee_id=13, email='user3@company.io', first_name='Foo3', last_name='Bar3',
                                        is_active=False)

        ProjectAllocation.objects.create(user=cls.user1, position=cls.position1, utilization=50,
                                         start_date='2023-01-01', end_date='2023-03-31')
        ProjectAllocation.objects.create(user=cls.user1, position=cls.position2, utilization=70,
                                         start_date='2023-02-25', end_date='2023-03-31')
        ProjectAllocation.objects.create(user=cls.user2, position=cls.position2, utilization=70,
                                         start_date='2023-07-01', end_date='2023-07-31')

    def test_talent_details(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_skill_industry_details', kwargs={'user_id': self.user1.id})
        response = self.client.get(url, format='json')

        self.assertEqual(response.data[ResponseKeys.USER][ResponseKeys.SKILLS][0]['rating'], 0)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_talent_invalid_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_skill_industry_details', kwargs={'user_id': 1145})
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], ErrorMessages.USER_DOES_NOT_EXIST)


class AddUserSkillIndustryDetailsTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(PermissionKeys.INDUSTRY_PROFICIENCY_PERMISSION[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)
        permission = get_permission_object(PermissionKeys.INDUSTRY_PROFICIENCY_PERMISSION[PermissionKeys.POST][1])
        cls.user.user_permissions.add(permission)
        permission = get_permission_object(PermissionKeys.USER_FORM_RELATED_PERMISSION[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        cls.client_ = Client.objects.create(name='Test', city='Bangalore', country='India', start_date='2020-01-10',
                                            account_manager=cls.user)
        cls.project = Project.objects.create(name='Junk', status=Project.Status.ACTIVE, city='Bangalore',
                                             country='India', client=cls.client_, start_date='2020-01-01')

        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(project=cls.project, role=role)
        cls.position1 = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-04-01'
        )
        cls.position2 = ProjectPosition.objects.create(
            project_role=project_role, utilization=70, experience_range_start=5, experience_range_end=8,
            start_date='2023-06-01', end_date='2023-07-01'
        )

        cls.skill1, _ = Skill.objects.get_or_create(name='Python')
        cls.skill2, _ = Skill.objects.get_or_create(name='Java')

        cls.user1 = User.objects.create(employee_id=11, email='user1@company.io', first_name='Foo1', last_name='Bar1',
                                        career_start_date='2019-07-15')
        ProficiencyMapping.objects.create(user=cls.user1, skill=cls.skill1, rating=4)

        cls.user2 = User.objects.create(employee_id=12, email='user2@company.io', first_name='Foo2', last_name='Bar2',
                                        career_start_date='2015-01-01')
        ProficiencyMapping.objects.create(user=cls.user2, skill=cls.skill1, rating=2)
        ProficiencyMapping.objects.create(user=cls.user2, skill=cls.skill2, rating=4)

        cls.user3 = User.objects.create(employee_id=13, email='user3@company.io', first_name='Foo3', last_name='Bar3',
                                        is_active=False)

        ProjectAllocation.objects.create(user=cls.user1, position=cls.position1, utilization=50,
                                         start_date='2023-01-01', end_date='2023-03-31')
        ProjectAllocation.objects.create(user=cls.user1, position=cls.position2, utilization=70,
                                         start_date='2023-02-25', end_date='2023-03-31')
        ProjectAllocation.objects.create(user=cls.user2, position=cls.position2, utilization=70,
                                         start_date='2023-07-01', end_date='2023-07-31')

    def test_talent_details(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_skill_industry_details', kwargs={'user_id': self.user1.id})

        data = {
            "industries": [],
            "skills": [
                {
                    "skillName": "Java",
                    "rating": 1
                }]
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.data[ResponseKeys.USER][ResponseKeys.SKILLS][0]['rating'], 1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_talent_invalid_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_skill_industry_details', kwargs={'user_id': 1145})
        data = {
            "industries": [],
            "skills": [
                {
                    "skillName": "Java",
                    "rating": 1
                }]
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], ErrorMessages.USER_DOES_NOT_EXIST)

    def test_skill_invalid(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_skill_industry_details', kwargs={'user_id': self.user1.id})
        data = {
            "industries": [],
            "skills": [
                {
                    "skillName": "Javaas",
                    "rating": 1
                }]
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)


class PermissionsTestCase(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.user1 = User.objects.create(employee_id=11, email='user1@company.io', first_name='Foo1', last_name='Bar1',
                                        career_start_date='2019-07-15')
        cls.group = Group.objects.get(name='user')
        permission = get_permission_object(PermissionKeys.USER_FORM_RELATED_PERMISSION[PermissionKeys.POST][0])
        cls.user1.groups.add(cls.group)
        cls.user.user_permissions.add(permission)

        ContentType.objects.create(
            app_label='user',
            model='industry_mapping'
        )

    def test_assign_form_permission(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:add_user_groups_permission')
        data = {
            "action": "assign_form_permissions"
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_revoke_form_permission(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:add_user_groups_permission')
        data = {
            "action": "revoke_form_permissions"
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_assign_proficiency_mapping_permissions(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:add_user_groups_permission')
        data = {
            "action": "assign_proficiency_mapping_permissions"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_revoke_proficiency_mapping_permissions(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:add_user_groups_permission')
        data = {
            "action": "revoke_proficiency_mapping_permissions"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_assign_industry_mapping_permissions(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:add_user_groups_permission')
        data = {
            "action": "assign_industry_mapping_permissions"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_revoke_industry_mapping_permissions(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:add_user_groups_permission')
        data = {
            "action": "revoke_industry_mapping_permissions"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_assign_user_experience_permissions(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:add_user_groups_permission')
        data = {
            "action": "assign_edit_user_experience_permissions"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_revoke_user_experience_permissions(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:add_user_groups_permission')
        data = {
            "action": "revoke_edit_user_experience_permissions"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class UserFormPermissionsTestCase(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.user1 = User.objects.create(employee_id=11, email='user1@company.io', first_name='Foo1', last_name='Bar1',
                                        career_start_date='2019-07-15')
        cls.group = Group.objects.get(name='user')
        permission = get_permission_object(PermissionKeys.USER_FORM_RELATED_PERMISSION[PermissionKeys.POST][0])
        cls.user1.groups.add(cls.group)
        cls.user.user_permissions.add(permission)

    def test_user_has_permission(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:form_permission_auth')
        response = self.client.post(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['has_permission'], False)


class EditUserDetailsTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(PermissionKeys.USER_DETAIL_PERMISSIONS[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)
        permission = get_permission_object(PermissionKeys.USER_DETAIL_PERMISSIONS[PermissionKeys.PATCH][0])
        cls.user.user_permissions.add(permission)

        cls.role1, _ = Role.objects.get_or_create(name='BE')
        cls.role2, _ = Role.objects.get_or_create(name='FE')
        cls.skill1, _ = Skill.objects.get_or_create(name='Python')
        cls.skill2, _ = Skill.objects.get_or_create(name='Java')
        cls.industry1, _ = Industry.objects.get_or_create(name='Consulting')
        cls.industry2, _ = Industry.objects.get_or_create(name='Sales')

        cls.user1 = User.objects.create(employee_id=11, email='user1@company.io', first_name='Foo1', last_name='Bar1',
                                        career_start_date='2019-07-15', function='Delivery',
                                        current_status='Active', cb_profile_link='https://drive.google.com')
        ProficiencyMapping.objects.create(user=cls.user1, skill=cls.skill1, rating=2)

    def test_invalid_user_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_details', kwargs={'user_id': 45})
        data = {
            "function": "",
            "lwd": None,
            "role": self.role2.id,
            "cb_profile_link": "",
            "ga_profile_link": "",
            "industries": [],
            "skills": [

            ]
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], ErrorMessages.USER_DOES_NOT_EXIST)

    def test_edit_user_status(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_details', kwargs={'user_id': self.user1.id})
        data = {
            "status": "Closed"
        }
        response = self.client.patch(url, data, format='json')
        self.user1.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user1.current_status, 'Closed')

    def test_edit_user_function(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_details', kwargs={'user_id': self.user1.id})
        data = {
            "function": "abc"
        }
        response = self.client.patch(url, data, format='json')
        self.user1.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user1.function, 'abc')

    def test_edit_user_lwd(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_details', kwargs={'user_id': self.user1.id})
        data = {
            "lwd": "2023-10-02"
        }
        response = self.client.patch(url, data, format='json')
        self.user1.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user1.last_working_day.strftime('%Y-%m-%d'), "2023-10-02")

    def test_edit_user_role(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_details', kwargs={'user_id': self.user1.id})
        data = {
            "role": self.role2.id
        }
        response = self.client.patch(url, data, format='json')
        self.user1.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user1.role.name, self.role2.name)

    def test_edit_user_cb_profile(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_details', kwargs={'user_id': self.user1.id})
        data = {
            "cb_profile_link": "https://drive.google.com/cb"
        }
        response = self.client.patch(url, data, format='json')
        self.user1.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user1.cb_profile_link, 'https://drive.google.com/cb')

    def test_edit_user_ga_profile(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_details', kwargs={'user_id': self.user1.id})
        data = {
            "ga_profile_link": "https://drive.google.com/ga"
        }
        response = self.client.patch(url, data, format='json')
        self.user1.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user1.ga_profile_link, 'https://drive.google.com/ga')

    def test_edit_user_industry(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_details', kwargs={'user_id': self.user1.id})
        data = {
            "industries": [self.industry1.id]
        }
        response = self.client.patch(url, data, format='json')
        self.user1.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user1.industries.first().id, self.industry1.id)

    def test_edit_user_skill(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:user_details', kwargs={'user_id': self.user1.id})
        data = {
            "skills": [
                {
                    "skill_name": "Java",
                    "rating": 4
                }
            ]
        }
        response = self.client.patch(url, data, format='json')
        self.user1.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(ProficiencyMapping.objects.filter(user_id=self.user1.id).all()), 2)


class AddUserExperienceDetailsTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(PermissionKeys.EDIT_USER_EXPERIENCE_PERMISSION[0])
        cls.user.user_permissions.add(permission)
        permission = get_permission_object(PermissionKeys.USER_FORM_RELATED_PERMISSION[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        cls.user1 = User.objects.create(employee_id=11, email='user1@company.io', first_name='Foo1', last_name='Bar1',
                                        career_start_date='2019-07-15', career_break_months=0)

    def test_add_user_experience_details(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:edit_user_experience', kwargs={'user_id': self.user1.id})

        data = {
            "career_break_months": 0,
            "career_start_date": "2021-11-15"
        }

        response = self.client.post(url, data, format='json')
        self.user1.refresh_from_db()
        self.assertEqual(response.data[ResponseKeys.USER][ResponseKeys.CAREER_START_DATE],
                         self.user1.career_start_date.strftime('%Y-%m-%d'))
        self.assertEqual(response.data[ResponseKeys.USER][ResponseKeys.CAREER_BREAK_MONTHS],
                         self.user1.career_break_months)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invalid_user_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:user:edit_user_experience', kwargs={'user_id': self.user1.id + 10})

        data = {
            "career_break_months": 0,
            "career_start_date": "2021-11-15"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], ErrorMessages.USER_DOES_NOT_EXIST)


class ListUserGroupAPITest(BaseTestCase):
    url = reverse('v1:user:user-management-view')

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        permission = get_permission_object(PermissionKeys.USER_GROUP[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)
        permission = get_permission_object(PermissionKeys.USER_GROUP[PermissionKeys.PUT][0])
        cls.user.user_permissions.add(permission)
        group, created = Group.objects.get_or_create(id=4)
        cls.user.groups.add(group)

    def test_list_user_group_api(self):
        self.client.force_authenticate(user=self.user)
        data = {'page': 1, 'size': 10}

        response = self.client.get(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['users'][0]['user_name'], self.user.first_name + ' ' + self.user.last_name)
        self.assertEqual(response.data['users'][0]['group_id'], self.user.groups.values_list('id', flat=True)[0])


class AddUserGroupAPITest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        permission = get_permission_object(PermissionKeys.USER_GROUP[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)
        permission = get_permission_object(PermissionKeys.USER_GROUP[PermissionKeys.PUT][0])
        cls.user.user_permissions.add(permission)
        group, created = Group.objects.get_or_create(id=4)
        cls.user.groups.add(group)

    def test_list_user_group(self):
        url = reverse('v1:user:get-user-groups')
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url, format='json')
        self.assertEqual(response.data['count'], 6)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_user_group(self):
        url = reverse('v1:user:edit-user-group')
        self.client.force_authenticate(user=self.user)
        data = [
            {
                "group_id": 1,
                "user_id": self.user.id
            }
        ]
        response = self.client.put(url, data, format='json')
        group = self.user.groups.first()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(group.id, 1)


class LocationServiceTest(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(PermissionKeys.USER_DETAIL_PERMISSIONS[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)
        group, created = Group.objects.get_or_create(id=4)
        cls.user.groups.add(group)

        cls.user1 = User.objects.create(employee_id=11, email='user1@company.io', first_name='Foo1', last_name='Bar1',
                                        career_start_date='2019-07-15', work_location='Bangalore', country='India')

        cls.user2 = User.objects.create(employee_id=12, email='user2@company.io', first_name='Foo2', last_name='Bar2',
                                        career_start_date='2015-01-01', designation="SDE L1", work_location='Hyderabad',
                                        country='India')

        cls.user3 = User.objects.create(employee_id=13, email='user3@company.io', first_name='Foo3', last_name='Bar3',
                                        is_active=False, work_location='New York', country='USA')

    def test_countries_api(self):
        url = reverse("v1:user:get-user-countries")
        self.client.force_authenticate(user=self.user)
        response = self.client.get(url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 3)

    def test_cities_api(self):
        url = reverse("v1:user:get-user-cities")
        self.client.force_authenticate(user=self.user)

        response = self.client.get(url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 3)

    def test_cities_api_with_filter(self):
        url = reverse("v1:user:get-user-cities")
        self.client.force_authenticate(user=self.user)

        data = {"countries": ["India"]}

        response = self.client.get(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 2)
