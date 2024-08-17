import datetime
import logging
from unittest.mock import patch
from datetime import date, timedelta

from django.urls import reverse
from django.contrib.contenttypes.models import ContentType
from rest_framework import status
from rest_framework.test import APITestCase
from django.core.management import call_command

from client.models import Client
from common.models import Skill
from project.constants import ResponseKeys, PermissionKeys, ErrorMessages
from project.models import Project, ProjectPosition, ProjectPositionSkills, ProjectRole, ProjectAllocation, \
    ProjectAllocationRequest, Notification
from user.models import User, Role
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
            employee_id=1, email='user@company.io', first_name='Foo', last_name='Bar')


class AddProjectTests(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PRIVILEGED_STATUS_PERMISSION)
        cls.user.user_permissions.add(permission)

        cls.client_ = Client.objects.create(name='Test', city='Bangalore', country='India', start_date='2020-01-10',
                                            account_manager=cls.user)

    def test_add_project(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project')
        data = {
            'name': 'Test Project',
            'client': self.client_.id,
            'status': Project.Status.ACTIVE,
            'city': 'Blr',
            'country': 'India',
            'startDate': '2022-06-01',
            'endDate': '2025-01-01',
            'engagementType': Project.Engagement.FR,
            'deliveryMode': Project.DeliveryMode.HYBRID,
            'currency': 'INR',
            'pocs': [
                {
                    'name': 'poc1',
                    'email': 'poc1@gmail.com',
                    'phone_number': 8181818181
                }
            ]
        }

        response = self.client.post(url, data, format='json')
        project = Project.objects.filter(name='Test Project').first()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data[ResponseKeys.PROJECT]['id'], project.id)
        self.assertEqual(project.client.id, self.client_.id)
        self.assertEqual(project.created_by.id, self.user.id)
        self.assertEqual(self.client_.account_manager, project.account_manager)
        self.assertEqual(project.pocs.count(), 1)

    def test_add_project_with_account_manager(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project')
        data = {
            'name': 'Test Project',
            'client': self.client_.id,
            'status': Project.Status.ACTIVE,
            'city': 'Blr',
            'country': 'India',
            'startDate': '2022-06-01',
            'endDate': '2025-01-01',
            'engagementType': Project.Engagement.FR,
            'deliveryMode': Project.DeliveryMode.HYBRID,
            'currency': 'INR',
            'account_manager': self.user.id,
            'pocs': [
                {
                    'name': 'poc1',
                    'email': 'poc1@gmail.com',
                    'phone_number': 8181818181
                }
            ]
        }

        response = self.client.post(url, data, format='json')
        project = Project.objects.filter(name='Test Project').first()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data[ResponseKeys.PROJECT]['id'], project.id)
        self.assertEqual(project.client.id, self.client_.id)
        self.assertEqual(project.created_by.id, self.user.id)
        self.assertEqual(project.account_manager, self.user)
        self.assertEqual(project.pocs.count(), 1)

    def test_add_project_unauthorized_status(self):
        permission = get_permission_object(
            PermissionKeys.PRIVILEGED_STATUS_PERMISSION)
        self.user.user_permissions.remove(permission)

        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project')
        data = {
            'name': 'Test Project',
            'client': self.client_.id,
            'status': Project.Status.ACTIVE,
            'city': 'Blr',
            'country': 'India',
            'startDate': '2022-06-01'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'],
                         ErrorMessages.PRIVILEGED_STATUS_PERMISSION_DENIED.format(status=data['status'].lower()))


class PatchProjectTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_PERMISSIONS[PermissionKeys.PATCH][0])
        cls.user.user_permissions.add(permission)

        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        cls.project = Project.objects.create(name='Junk 1', status=Project.Status.SIGNED, city='Bangalore',
                                             country='India', client=client, start_date='2020-01-01',
                                             end_date='2024-10-10')

    def test_patch_project_invalid_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-detail', kwargs={'project_id': 0})
        data = {'status': Project.Status.ACTIVE}
        response = self.client.patch(url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'],
                         ErrorMessages.INVALID_PROJECT_ID)

    def test_patch_project_status(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-detail',
                      kwargs={'project_id': self.project.id})
        data = {'status': Project.Status.ACTIVE}
        response = self.client.patch(url, data=data, format='json')
        self.project.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.project.status, Project.Status.ACTIVE)

    @patch('project.services.datetime')
    def test_patch_project_closed_status(self, datetime_mock):
        datetime_mock.date.today.return_value = date(2023, 3, 1)
        self.client.force_authenticate(user=self.user)
        role = Role.objects.create(name='Role test')
        project_role = ProjectRole.objects.create(
            project=self.project, role=role)
        ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-05-01'
        )
        url = reverse('v1:project:project-detail',
                      kwargs={'project_id': self.project.id})

        data = {'status': Project.Status.CLOSED}
        response = self.client.patch(url, data=data, format='json')
        self.project.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.ALL_POSITIONS_RELATED_TO_PROJECT_IS_NOT_CLOSED)


class ListProjectTests(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_PERMISSIONS[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)

        client1 = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        client2 = Client.objects.create(
            name='Random', city='Hyderabad', country='India', start_date='2020-01-10')
        Project.objects.create(name='Junk 1', status=Project.Status.ACTIVE, city='Bangalore', country='India',
                               client=client1, start_date='2020-01-01', end_date='2021-03-01')
        Project.objects.create(name='Junk 2', status=Project.Status.ACTIVE, city='Hyderabad', country='India',
                               client=client2, start_date='2021-01-01', end_date='2021-11-01')
        Project.objects.create(name='Dummy', status=Project.Status.SIGNED, city='Bangalore', country='India',
                               client=client1, start_date='2022-01-01', end_date='2022-06-01')
        Project.objects.create(name='Test', status=Project.Status.HOT, city='Bangalore', country='India',
                               client=client2, start_date='2023-05-01', end_date='2023-09-01')

    def test_list_projects(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 4)

    def test_list_projects_pagination(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project')
        data = {'page': 1, 'size': 2}
        response = self.client.get(url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data[ResponseKeys.PROJECTS]), 2)
        self.assertEqual(response.data[ResponseKeys.COUNT], 4)

    def test_list_projects_filter(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project')
        data = {'startDateStart': '2021-01-01',
                'startDateEnd': '2022-11-11', 'status': Client.Status.ACTIVE}
        response = self.client.get(url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 1)

    def test_list_projects_search(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project')
        data = {'search': 'test'}
        response = self.client.get(url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 3)


class RetrieveProjectTests(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_PERMISSIONS[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)

        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        cls.project = Project.objects.create(name='Test', status=Project.Status.HOT, city='Bangalore', country='India',
                                             client=client, start_date='2023-05-01')

    def test_retrieve_project(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-detail',
                      kwargs={'project_id': self.project.id})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data[ResponseKeys.PROJECT]['id'], self.project.id)

    def test_retrieve_project_invalid_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-detail', kwargs={'project_id': 0})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'],
                         ErrorMessages.INVALID_PROJECT_ID)


class ProjectCreationDropdownsTest(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_CREATION_DROPDOWN_PERMISSIONS[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PRIVILEGED_STATUS_PERMISSION)
        cls.user.user_permissions.add(permission)

        Client.objects.create(name='Test 1', city='Bangalore',
                              country='India', start_date='2020-01-10')
        Client.objects.create(name='Test 2', city='Bangalore', country='India', start_date='2020-01-10',
                              status=Client.Status.DORMANT)
        Client.objects.create(name='Test 3', city='Bangalore',
                              country='India', start_date='2020-01-10')

    def test_project_creation_dropdowns_for_privileged_users(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-creation-dropdowns')
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            len(response.data[ResponseKeys.DROPDOWNS][ResponseKeys.STATUS]), 6)
        self.assertEqual(
            len(response.data[ResponseKeys.DROPDOWNS][ResponseKeys.ENGAGEMENTS]), 2)
        self.assertEqual(
            len(response.data[ResponseKeys.DROPDOWNS][ResponseKeys.DELIVERY_MODES]), 3)
        self.assertEqual(
            len(response.data[ResponseKeys.DROPDOWNS][ResponseKeys.CLIENTS]), 2)

    def test_project_creation_dropdowns_for_normal_users(self):
        permission = get_permission_object(
            PermissionKeys.PRIVILEGED_STATUS_PERMISSION)
        self.user.user_permissions.remove(permission)

        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-creation-dropdowns')
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            len(response.data[ResponseKeys.DROPDOWNS][ResponseKeys.STATUS]), 3)
        self.assertEqual(
            len(response.data[ResponseKeys.DROPDOWNS][ResponseKeys.ENGAGEMENTS]), 2)
        self.assertEqual(
            len(response.data[ResponseKeys.DROPDOWNS][ResponseKeys.DELIVERY_MODES]), 3)
        self.assertEqual(
            len(response.data[ResponseKeys.DROPDOWNS][ResponseKeys.CLIENTS]), 2)


class ProjectPositionDropdownsTest(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_POSITION_DROPDOWN_PERMISSIONS[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)

        Role.objects.get_or_create(name='Role 1')
        Role.objects.get_or_create(name='Role 2')
        Skill.objects.get_or_create(name='Skill 1')
        Skill.objects.get_or_create(name='Skill 2')
        Skill.objects.get_or_create(name='Skill 3')

    def test_project_position_dropdowns(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-position-dropdowns')
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            len(response.data[ResponseKeys.DROPDOWNS][ResponseKeys.ROLES]), 2)
        self.assertEqual(
            len(response.data[ResponseKeys.DROPDOWNS][ResponseKeys.SKILLS]), 3)

    def test_project_position_dropdowns_search(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-position-dropdowns')
        data = {'search': 2}
        response = self.client.get(url, data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            len(response.data[ResponseKeys.DROPDOWNS][ResponseKeys.ROLES]), 1)
        self.assertEqual(
            len(response.data[ResponseKeys.DROPDOWNS][ResponseKeys.SKILLS]), 1)


class AddProjectPositionTests(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_POSITION_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        cls.project = Project.objects.create(name='Test', status=Project.Status.HOT, city='Bangalore', country='India',
                                             client=client, start_date='2023-05-01', end_date='2026-05-01')  # Make sure the position start dates and end dates defined in the below test cases are in between the project date range.

        cls.role, _ = Role.objects.get_or_create(name='Role')
        cls.skill1, _ = Skill.objects.get_or_create(name='Skill 1')
        cls.skill2, _ = Skill.objects.get_or_create(name='Skill 2')
        cls.skill3, _ = Skill.objects.get_or_create(name='Skill 3')

    def test_add_project_position(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-position')
        data = {
            'project': self.project.id,
            'role': self.role.id,
            "positions": [
                {
                    "startDate": "2023-05-02",
                    "endDate": "2023-10-29",
                    "skills": [self.skill2.id, self.skill1.id, self.skill3.id],
                    "experienceRangeStart": 3,
                    "experienceRangeEnd": 5,
                    "utilization": 50
                }
            ]
        }

        response = self.client.post(url, data, format='json')
        position = ProjectPosition.objects.first()
        position_skills = ProjectPositionSkills.objects.filter(
            position=position)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(position.project_role.project.id, self.project.id)
        self.assertEqual(position.project_role.role.id, self.role.id)
        self.assertEqual(position_skills.count(), 3)
        self.assertEqual(position_skills.get(skill=self.skill1).priority, 2)
        self.assertEqual(position_skills.get(skill=self.skill2).priority, 1)
        self.assertEqual(position_skills.get(skill=self.skill3).priority, 3)

    def test_add_project_position_beyond_project_date(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-position')
        data = {
            'project': self.project.id,
            'role': self.role.id,
            "positions": [
                {
                    "startDate": "2023-06-01",
                    "endDate": "2026-05-02",
                    "skills": [self.skill2.id, self.skill1.id, self.skill3.id],
                    "experienceRangeStart": 3,
                    "experienceRangeEnd": 5,
                    "utilization": 50
                }
            ]
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            ErrorMessages.POSITION_DATE_IS_BEYOND_PROJECT_END_DATE, response.data['message'])

    def test_add_project_position_before_project_start_date(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-position')
        data = {
            'project': self.project.id,
            'role': self.role.id,
            "positions": [
                {
                    "startDate": "2023-04-01",
                    "endDate": "2024-01-01",
                    "skills": [self.skill2.id, self.skill1.id, self.skill3.id],
                    "experienceRangeStart": 3,
                    "experienceRangeEnd": 5,
                    "utilization": 50
                }
            ]
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            ErrorMessages.POSITION_START_DATE_IS_BEFORE_PROJECT_START_DATE, response.data['message'])


class EditProjectPositionTests(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_POSITION_PERMISSIONS[PermissionKeys.PATCH][0])
        cls.user.user_permissions.add(permission)

        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        project = Project.objects.create(name='Test', status=Project.Status.HOT, city='Bangalore', country='India',
                                         client=client, start_date='2023-05-01', end_date='2024-05-01')
        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(project=project, role=role)
        cls.position = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-05-01'
        )
        cls.skill1, _ = Skill.objects.get_or_create(name='Skill 1')
        cls.skill2, _ = Skill.objects.get_or_create(name='Skill 2')
        cls.skill3, _ = Skill.objects.get_or_create(name='Skill 3')
        user1 = User.objects.create_user(
            employee_id=5, email='user5@company.io', first_name='Foo5', last_name='Bar5')
        ProjectAllocation.objects.update_or_create(user=user1, position=cls.position, utilization=40,
                                                   start_date='2023-01-10', end_date='2023-02-25',
                                                   kt_period=5)

    def test_edit_project_position_invalid_id(self):
        self.client.force_authenticate(user=self.user)

        url = reverse('v1:project:project-position-detail',
                      kwargs={'position_id': 10000})
        data = {
            "utilization": 100,
            "start_date": "2023-01-01",
            "end_date": None,
            "is_billable": True,
            "skills": [self.skill2.id, self.skill1.id, self.skill3.id]

        }
        response = self.client.patch(url, data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'],
                         ErrorMessages.INVALID_POSITION_ID)

    def test_edit_project_position(self):
        self.client.force_authenticate(user=self.user)

        url = reverse('v1:project:project-position-detail',
                      kwargs={'position_id': self.position.id})
        data = {
            "utilization": 100,
            "start_date": "2023-01-01",
            "end_date": None,
            "is_billable": True,
            "skills": [self.skill2.id, self.skill1.id, self.skill3.id]

        }
        response = self.client.patch(url, data=data, format='json')
        self.position.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.position.utilization, 100)
        self.assertEqual(self.position.start_date.strftime(
            '%Y-%m-%d'), '2023-01-01')
        # 180 Days after project start date
        self.assertEqual(self.position.end_date.strftime(
            '%Y-%m-%d'), '2023-06-30')  # Changed to 6 months (180 days)

    def test_edit_project_position_beyond_project_date(self):
        self.client.force_authenticate(user=self.user)

        url = reverse('v1:project:project-position-detail',
                      kwargs={'position_id': self.position.id})
        data = {
            "utilization": 100,
            "is_billable": True,
            "start_date": "2023-01-01",
            "end_date": "2025-01-01",
            "skills": [self.skill2.id, self.skill1.id, self.skill3.id],
        }
        response = self.client.patch(url, data=data, format='json')
        self.position.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.POSITION_DATE_IS_BEYOND_PROJECT_END_DATE)

    def test_edit_project_position_start_date_greater_end_date(self):
        self.client.force_authenticate(user=self.user)

        url = reverse('v1:project:project-position-detail',
                      kwargs={'position_id': self.position.id})
        data = {
            "utilization": 100,
            "start_date": "2024-01-01",
            "end_date": "2023-01-01",
            "is_billable": True,
            "skills": [self.skill2.id, self.skill1.id, self.skill3.id],
        }
        response = self.client.patch(url, data=data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['non_field_errors'][0],
                         ErrorMessages.START_DATE_GREATER_THAN_END_DATE)

    def test_edit_project_position_date_range_beyond_allocation_date_range(self):
        self.client.force_authenticate(user=self.user)

        url = reverse('v1:project:project-position-detail',
                      kwargs={'position_id': self.position.id})
        data = {
            "utilization": 100,
            "start_date": "2023-01-01",
            "end_date": "2023-01-20",
            "is_billable": True,
            "skills": [self.skill2.id, self.skill1.id, self.skill3.id],
        }
        response = self.client.patch(url, data=data, format='json')
        self.position.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.POSITION_DATE_IS_BEYOND_ALLOCATION_DATE_RANGE)


class ProjectAllocateTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_POSITION_PERMISSIONS[PermissionKeys.PATCH][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PRIVILEGED_STATUS_PERMISSION)
        cls.user.user_permissions.add(permission)

        cls.user1 = User.objects.create_user(employee_id=5, email='user5@company.io', first_name='Foo5',
                                             last_name='Bar5')

        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        cls.project = Project.objects.create(name='demo1', status=Project.Status.HOT, city='Bangalore', country='India',
                                             client=client, start_date='2023-01-01', account_manager=cls.user1)
        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(
            project=cls.project, role=role)
        cls.position = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-05-01'
        )
        cls.other_position = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-05-01'
        )

        active_project = Project.objects.create(name='active_demo1', status=Project.Status.ACTIVE, city='Bangalore',
                                                country='India',
                                                client=client, start_date='2023-01-01')
        project_role = ProjectRole.objects.create(
            project=active_project, role=role)
        cls.position_active = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-02-01', end_date='2023-05-01'
        )

        closed_project = Project.objects.create(name='closed_demo1', status=Project.Status.CLOSED, city='Bangalore',
                                                country='India',
                                                client=client, start_date='2023-01-01')
        project_role = ProjectRole.objects.create(
            project=closed_project, role=role)
        cls.position_closed = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-02-01', end_date='2023-05-01'
        )

    def test_project_allocation(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation')
        data = {
            "user": self.user.id,
            "position": self.position.id,
            "utilization": 30,
            "start_date": "2023-03-15",
            "end_date": "2023-03-30",
            "kt_period": 10
        }
        response = self.client.post(url, data, format='json')
        project_allocation = ProjectAllocation.objects.first()
        notification = Notification.objects.filter(
            object_id=project_allocation.id).first()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(project_allocation.tentative, True)
        self.assertEqual(project_allocation.position.id, self.position.id)
        self.assertEqual(project_allocation.user.id, self.user.id)
        self.assertEqual(project_allocation.id, notification.object_id)
        self.assertEqual(self.project.account_manager, notification.receiver)

    def test_project_allocation_utilization_greaterthen_position_utilization(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation')
        data = {
            "user": self.user.id,
            "position": self.position.id,
            "utilization": 60,
            "start_date": "2023-03-15",
            "end_date": "2023-03-20",
            "kt_period": 10
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.REQUESTED_UTILIZATION_GREATER_THAN_POSITION_UTILIZATION)

    def test_project_allocation_not_possible(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation')
        ProjectAllocation.objects.create(user=self.user,
                                         position=self.position,
                                         utilization=60,
                                         start_date="2023-04-15",
                                         end_date="2023-04-20",
                                         kt_period=10)
        data = {
            "user": self.user.id,
            "position": self.position.id,
            "utilization": 50,
            "startDate": "2023-04-15",
            "endDate": "2023-04-20",
            "ktPeriod": 10
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.TALENT_IS_ALREADY_ALLOCATED_TO_ROLE)

    def test_project_allocation_same_talent_against_position(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation')
        ProjectAllocation.objects.create(user=self.user,
                                         position=self.position,
                                         utilization=60,
                                         start_date="2023-04-15",
                                         end_date="2023-04-17",
                                         kt_period=10)
        data = {
            "user": self.user.id,
            "position": self.position.id,
            "utilization": 50,
            "startDate": "2023-04-16",
            "endDate": "2023-04-20",
            "ktPeriod": 10
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.TALENT_IS_ALREADY_ALLOCATED_TO_ROLE)

    def test_project_allocation_same_talent_same_role_another_position(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation')
        ProjectAllocation.objects.create(user=self.user,
                                         position=self.position,
                                         utilization=60,
                                         start_date="2023-04-15",
                                         end_date="2023-04-17",
                                         kt_period=10)
        data = {
            "user": self.user.id,
            "position": self.other_position.id,
            "utilization": 50,
            "startDate": "2023-04-16",
            "endDate": "2023-04-20",
            "ktPeriod": 10
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.TALENT_IS_ALREADY_ALLOCATED_TO_ROLE)

    def test_active_project_allocation(self):
        self.client.force_authenticate(user=self.user)

        url = reverse('v1:project:project-allocation')
        data = {
            "user": self.user.id,
            "position": self.position_active.id,
            "utilization": 30,
            "start_date": "2023-04-21",
            "end_date": "2023-04-25",
            "kt_period": 10
        }
        response = self.client.post(url, data, format='json')

        project_allocation = ProjectAllocation.objects.first()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(project_allocation.tentative, False)
        self.assertEqual(project_allocation.position.id,
                         self.position_active.id)
        self.assertEqual(project_allocation.user.id, self.user.id)

    def test_closed_project_allocation(self):
        self.client.force_authenticate(user=self.user)

        url = reverse('v1:project:project-allocation')
        data = {
            "user": self.user.id,
            "position": self.position_closed.id,
            "utilization": 10,
            "start_date": "2023-04-21",
            "end_date": "2023-04-25",
            "kt_period": 10
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'],
                         ErrorMessages.PROJECT_IS_CLOSED)

    def test_allocation_beyond_position_range(self):
        self.client.force_authenticate(user=self.user)

        url = reverse('v1:project:project-allocation')
        data = {
            "user": self.user.id,
            "position": self.position.id,
            "utilization": 45,
            "start_date": "2023-04-21",
            "end_date": "2023-06-01",
            "kt_period": 10
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.ALLOCATION_IS_BEYOND_POSITION_DATE_RANGE)


class ProjectTimelineTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PROJECT_PERMISSIONS[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PRIVILEGED_STATUS_PERMISSION)
        cls.user.user_permissions.add(permission)

        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        cls.project = Project.objects.create(name='demo', status=Project.Status.HOT, city='Bangalore', country='India',
                                             client=client, start_date='2023-05-01')
        role1 = Role.objects.create(name='Role1')
        role2 = Role.objects.create(name='Role2')
        project_role1 = ProjectRole.objects.create(
            project=cls.project, role=role1)
        project_role2 = ProjectRole.objects.create(
            project=cls.project, role=role2)
        position1 = ProjectPosition.objects.create(
            project_role=project_role1, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-02-01'
        )
        position2 = ProjectPosition.objects.create(
            project_role=project_role2, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-02-01'
        )
        ProjectPosition.objects.create(
            project_role=project_role2, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-02-01'
        )
        user2 = User.objects.create_user(
            employee_id=2, email='user2@company.io', first_name='Foo2', last_name='Bar2')
        user3 = User.objects.create_user(
            employee_id=3, email='user3@company.io', first_name='Foo3', last_name='Bar3')
        user4 = User.objects.create_user(employee_id=4, email='user4@company.io', first_name='Foo4', last_name='Bar4',
                                         designation='SDE L1')
        user5 = User.objects.create_user(
            employee_id=5, email='user5@company.io', first_name='Foo5', last_name='Bar5')
        ProjectAllocation.objects.update_or_create(user=user2, position=position1, utilization=40,
                                                   start_date='2023-04-21', end_date='2023-04-25',
                                                   kt_period=5)
        ProjectAllocation.objects.update_or_create(user=user3, position=position2, utilization=60,
                                                   start_date='2023-04-21', end_date='2023-04-25',
                                                   kt_period=10)
        ProjectAllocation.objects.update_or_create(user=user4, position=position2, utilization=100,
                                                   start_date='2023-04-21', end_date='2023-04-25',
                                                   kt_period=15)
        ProjectAllocationRequest.objects.create(user=user5, position=position1, utilization=75,
                                                start_date='2023-05-21', end_date='2023-06-25',
                                                kt_period=5, status='PENDING', tentative=True)

    def test_retrieve_project_timeline(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-timeline',
                      kwargs={'project_id': self.project.id})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            len(response.data[ResponseKeys.PROJECT][ResponseKeys.ROLES]), 2)
        self.assertEqual(len(
            response.data[ResponseKeys.PROJECT][ResponseKeys.ROLES][1][ResponseKeys.POSITIONS][0][ResponseKeys.USERS]),
            2)

    def test_timeline_projects_search_by_user(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-timeline',
                      kwargs={'project_id': self.project.id})
        data = {'search': 'o4 bar', 'responseDateStart': '2022-12-05',
                'responseDateEnd': '2022-12-08'}
        response = self.client.get(url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data[ResponseKeys.PROJECT][ResponseKeys.ROLES][0][ResponseKeys.POSITIONS][0][ResponseKeys.USERS][
                0]['full_name_with_exp_band'], 'Foo4 Bar4 - L1')

    def test_timeline_projects_search_by_role(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-timeline',
                      kwargs={'project_id': self.project.id})
        data = {'search': 'Role1'}
        response = self.client.get(url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            len(response.data[ResponseKeys.PROJECT][ResponseKeys.ROLES]), 1)

    def test_retrieve_timeline_project_invalid_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-timeline', kwargs={'project_id': 0})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'],
                         ErrorMessages.INVALID_PROJECT_ID)

    def test_requested_talent(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-timeline',
                      kwargs={'project_id': self.project.id})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.PROJECT][ResponseKeys.ROLES][0][ResponseKeys.POSITIONS][0]
                         [ResponseKeys.USERS][1]['requests'][0]['start_date'], '2023-05-21')

    def test_open_position(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-timeline',
                      kwargs={'project_id': self.project.id})
        response = self.client.get(url, format='json')
        self.assertEqual(
            response.data[ResponseKeys.PROJECT]['open_positions'], 1)
        self.assertEqual(
            response.data[ResponseKeys.PROJECT]['total_positions'], 3)


class EditProjectDetails(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        permission = get_permission_object(
            PermissionKeys.PROJECT_PERMISSIONS[PermissionKeys.PUT][0])
        cls.user.user_permissions.add(permission)
        permission = get_permission_object(
            PermissionKeys.PRIVILEGED_STATUS_PERMISSION)
        cls.user.user_permissions.add(permission)

        cls.client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        cls.client2 = Client.objects.create(
            name='Test1', city='Bangalore', country='India', start_date='2020-01-10')

        cls.project = Project.objects.create(name='Test', status=Project.Status.HOT, city='Bangalore', country='India',
                                             client=cls.client, start_date='2023-05-01')

    def test_edit_project_invalid_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-detail', kwargs={'project_id': 12})
        data = {
            'name': 'Test Project',
            'client': self.client2.id,
            'status': Project.Status.ACTIVE,
            'city': 'Pune',
            'country': 'India',
            'startDate': '2022-06-01',
            'endDate': '2025-01-01',
            'engagementType': Project.Engagement.FR,
            'deliveryMode': Project.DeliveryMode.REMOTE,
            'currency': 'INR',
            'account_manager': self.user.id,
            'pocs': [
                {
                    'name': 'poc1',
                    'email': 'poc1@gmail.com',
                    'phone_number': 8181818181
                }
            ]
        }

        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'],
                         ErrorMessages.INVALID_PROJECT_ID)

    def test_edit_project_details(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-detail',
                      kwargs={'project_id': self.project.id})
        data = {
            'name': 'Test Project',
            'client': self.client2.id,
            'status': Project.Status.ACTIVE,
            'city': 'Pune',
            'country': 'India',
            'startDate': '2022-06-01',
            'endDate': '2025-01-01',
            'engagementType': Project.Engagement.FR,
            'deliveryMode': Project.DeliveryMode.REMOTE,
            'currency': 'INR',
            'account_manager': self.user.id,
            'pocs': [
                {
                    'name': 'poc1',
                    'email': 'poc1@gmail.com',
                    'phone_number': 8181818181
                }
            ]
        }

        response = self.client.put(url, data, format='json')
        self.project.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data[ResponseKeys.PROJECT]['id'], self.project.id)
        self.assertEqual(self.project.client.id, self.client2.id)
        self.assertEqual(self.project.status, Project.Status.ACTIVE)
        self.assertEqual(self.project.delivery_mode,
                         Project.DeliveryMode.REMOTE)
        self.assertEqual(self.project.city, 'Pune')
        self.assertEqual(self.project.pocs.count(), 1)

    def test_edit_project_closed_status(self):
        self.client.force_authenticate(user=self.user)
        role = Role.objects.create(name='Role test')
        project_role = ProjectRole.objects.create(
            project=self.project, role=role)
        ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2025-05-01'
        )
        url = reverse('v1:project:project-detail',
                      kwargs={'project_id': self.project.id})
        data = {
            'name': 'Test Project',
            'client': self.client2.id,
            'status': Project.Status.CLOSED,
            'city': 'Pune',
            'country': 'India',
            'startDate': '2022-06-01',
            'endDate': '2025-01-01',
            'engagementType': Project.Engagement.FR,
            'deliveryMode': Project.DeliveryMode.REMOTE,
            'currency': 'INR',
            'account_manager': self.user.id,
            'pocs': [
                {
                    'name': 'poc1',
                    'email': 'poc1@gmail.com',
                    'phone_number': 8181818181
                }
            ]
        }
        response = self.client.put(url, data=data, format='json')
        self.project.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.ALL_POSITIONS_RELATED_TO_PROJECT_IS_NOT_CLOSED)


class ProjectAllocateRequestTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_REQUEST_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PROJECT_POSITION_PERMISSIONS[PermissionKeys.PATCH][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PRIVILEGED_STATUS_PERMISSION)
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.ADMIN_NOTIFICATION_PERMISSION)
        cls.user.user_permissions.add(permission)

        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        project = Project.objects.create(name='demo1', status=Project.Status.HOT, city='Bangalore', country='India',
                                         client=client, start_date='2023-01-01')
        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(project=project, role=role)
        cls.position = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-05-01'
        )
        cls.other_position = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-05-01'
        )

        active_project = Project.objects.create(name='active_demo1', status=Project.Status.ACTIVE, city='Bangalore',
                                                country='India',
                                                client=client, start_date='2023-01-01')
        project_role = ProjectRole.objects.create(
            project=active_project, role=role)
        cls.position_active = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-02-01', end_date='2023-05-01'
        )

        closed_project = Project.objects.create(name='closed_demo1', status=Project.Status.CLOSED, city='Bangalore',
                                                country='India',
                                                client=client, start_date='2023-01-01')
        project_role = ProjectRole.objects.create(
            project=closed_project, role=role)
        cls.position_closed = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-02-01', end_date='2023-05-01'
        )

    def test_project_allocation_request(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request')
        data = {
            "user": self.user.id,
            "position": self.position.id,
            "utilization": 30,
            "start_date": "2023-03-15",
            "end_date": "2023-03-30",
            "kt_period": 10
        }
        response = self.client.post(url, data, format='json')
        project_allocation = ProjectAllocationRequest.objects.first()
        notification = Notification.objects.filter(
            object_id=project_allocation.id).first()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(project_allocation.tentative, True)
        self.assertEqual(project_allocation.position.id, self.position.id)
        self.assertEqual(project_allocation.user.id, self.user.id)
        self.assertEqual(notification.object_id, project_allocation.id)

    def test_project_allocation_request_when_start_date_greater_than_end_date(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request')
        data = {
            "user": self.user.id,
            "position": self.position.id,
            "utilization": 30,
            "start_date": "2023-04-15",
            "end_date": "2023-03-30",
            "kt_period": 10
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.START_DATE_GREATER_THAN_END_DATE)

    def test_project_allocation_request_when_no_end_date(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request')
        data = {
            "user": self.user.id,
            "position": self.position.id,
            "utilization": 30,
            "start_date": "2023-03-15",
            "kt_period": 10
        }
        response = self.client.post(url, data, format='json')
        project_allocation = ProjectAllocationRequest.objects.first()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(project_allocation.tentative, True)
        self.assertEqual(project_allocation.position.id, self.position.id)
        self.assertEqual(project_allocation.user.id, self.user.id)
        self.assertEqual(project_allocation.end_date.strftime(
            '%Y-%m-%d'), self.position.end_date)

    def test_project_allocation_request_utilization_greater_than_position_utilization(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request')
        data = {
            "user": self.user.id,
            "position": self.position.id,
            "utilization": 60,
            "start_date": "2023-03-15",
            "end_date": "2023-03-20",
            "kt_period": 10
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.REQUESTED_UTILIZATION_GREATER_THAN_POSITION_UTILIZATION)

    def test_project_allocation_request_not_possible(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request')
        ProjectAllocation.objects.create(user=self.user,
                                         position=self.position,
                                         utilization=60,
                                         start_date="2023-04-15",
                                         end_date="2023-04-20",
                                         kt_period=10)
        data = {
            "user": self.user.id,
            "position": self.position.id,
            "utilization": 50,
            "startDate": "2023-04-14",
            "endDate": "2023-04-20",
            "ktPeriod": 10
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.TALENT_IS_ALREADY_ALLOCATED_TO_ROLE)

    def test_project_allocation_request_same_talent_against_position(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request')
        ProjectAllocation.objects.create(user=self.user,
                                         position=self.position,
                                         utilization=60,
                                         start_date="2023-04-15",
                                         end_date="2023-04-17",
                                         kt_period=10)
        data = {
            "user": self.user.id,
            "position": self.position.id,
            "utilization": 50,
            "startDate": "2023-04-14",
            "endDate": "2023-04-20",
            "ktPeriod": 10
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.TALENT_IS_ALREADY_ALLOCATED_TO_ROLE)

    def test_project_allocation_request_same_talent_same_role_another_position(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request')
        ProjectAllocation.objects.create(user=self.user,
                                         position=self.position,
                                         utilization=60,
                                         start_date="2023-04-15",
                                         end_date="2023-04-17",
                                         kt_period=10)
        data = {
            "user": self.user.id,
            "position": self.other_position.id,
            "utilization": 50,
            "startDate": "2023-04-16",
            "endDate": "2023-04-20",
            "ktPeriod": 10
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.TALENT_IS_ALREADY_ALLOCATED_TO_ROLE)

    def test_active_project_allocation_request(self):
        self.client.force_authenticate(user=self.user)

        url = reverse('v1:project:project-allocation-request')
        data = {
            "user": self.user.id,
            "position": self.position_active.id,
            "utilization": 30,
            "start_date": "2023-04-21",
            "end_date": "2023-04-25",
            "kt_period": 10
        }
        response = self.client.post(url, data, format='json')

        project_allocation = ProjectAllocationRequest.objects.first()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(project_allocation.tentative, False)
        self.assertEqual(project_allocation.position.id,
                         self.position_active.id)
        self.assertEqual(project_allocation.user.id, self.user.id)

    def test_closed_project_allocation_request(self):
        self.client.force_authenticate(user=self.user)

        url = reverse('v1:project:project-allocation-request')
        data = {
            "user": self.user.id,
            "position": self.position_closed.id,
            "utilization": 10,
            "start_date": "2023-04-21",
            "end_date": "2023-04-25",
            "kt_period": 10
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'],
                         ErrorMessages.PROJECT_IS_CLOSED)

    def test_allocation_request_beyond_position_range(self):
        self.client.force_authenticate(user=self.user)

        url = reverse('v1:project:project-allocation-request')
        data = {
            "user": self.user.id,
            "position": self.position.id,
            "utilization": 45,
            "start_date": "2023-04-21",
            "end_date": "2023-06-01",
            "kt_period": 10
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.ALLOCATION_IS_BEYOND_POSITION_DATE_RANGE)


class ProjectAllocateRequestDeleteTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_REQUEST_PERMISSIONS[PermissionKeys.DELETE][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        project = Project.objects.create(name='demo1', status=Project.Status.HOT, city='Bangalore', country='India',
                                         client=client, start_date='2023-01-01')
        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(project=project, role=role)
        cls.position = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-05-01')
        cls.project_allocation_request = ProjectAllocationRequest.objects.create(user=cls.user, position=cls.position,
                                                                                 utilization=60,
                                                                                 start_date="2023-04-15",
                                                                                 end_date="2023-04-20", kt_period=10)

    def test_allocation_request_delete(self):
        self.client.force_authenticate(user=self.user)

        url = reverse('v1:project:project-allocation-request-detail',
                      kwargs={'allocation_request_id': self.project_allocation_request.id})
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_invalid_allocation_request_id(self):
        self.client.force_authenticate(user=self.user)

        url = reverse('v1:project:project-allocation-request-detail',
                      kwargs={'allocation_request_id': 14})
        response = self.client.delete(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.INVALID_PROJECT_ALLOCATION_REQUEST_ID)


class EditProjectAllocationTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_PERMISSIONS[PermissionKeys.PUT][0])
        cls.user.user_permissions.add(permission)

        cls.user1 = User.objects.create_user(employee_id=5, email='user5@company.io', first_name='Foo5',
                                             last_name='Bar5')
        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        cls.project = Project.objects.create(name='demo1', status=Project.Status.HOT, city='Bangalore', country='India',
                                             client=client, start_date='2023-01-01', account_manager=cls.user1)
        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(
            project=cls.project, role=role)
        cls.position = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-12-01'
        )

        cls.allocation = ProjectAllocation.objects.create(user=cls.user, position=cls.position,
                                                          utilization=60,
                                                          start_date="2023-01-01",
                                                          end_date="2023-01-25", kt_period=10)

    def test_edit_project_invalid_allocation_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-detail',
                      kwargs={'allocation_id': 15})
        data = {
            "user": self.user.id,
            "utilization": 60,
            "end_date": datetime.date.today() + datetime.timedelta(days=1),
        }
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.INVALID_PROJECT_ALLOCATION_ID)

    @patch('project.services.datetime')
    @patch('project.serializers.datetime')
    def test_edit_project_allocation(self,  datetime_mock_serializer, datetime_mock_service):
        self.client.force_authenticate(user=self.user)

        datetime_mock_service.date.today.return_value = date(2023, 2, 28)
        datetime_mock_service.timedelta = timedelta

        datetime_mock_serializer.date.today.return_value = date(2023, 2, 28)
        datetime_mock_serializer.timedelta = timedelta
        url = reverse('v1:project:project-allocation-detail',
                      kwargs={'allocation_id': self.allocation.id})

        data = {
            "user": self.user.id,
            "utilization": 60,
            "end_date": date(2023, 3, 1) + datetime.timedelta(days=1),
        }

        response = self.client.put(url, data, format='json')

        self.allocation.refresh_from_db()
        notification = Notification.objects.filter(
            object_id=self.allocation.id).first()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.allocation.end_date, data['end_date'])
        self.assertEqual(self.allocation.utilization, data['utilization'])
        self.assertEqual(self.allocation.id, notification.object_id)

    def test_edit_project_allocation_beyond_position(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-detail',
                      kwargs={'allocation_id': self.allocation.id})
        data = {
            "user": self.user.id,
            "utilization": 60,
            "end_date": "2025-01-30",
        }
        response = self.client.put(url, data, format='json')
        self.allocation.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.ALLOCATION_IS_BEYOND_POSITION_DATE_RANGE)

    @patch('project.services.datetime')
    @patch('project.serializers.datetime')
    def test_edit_project_allocation_differ_utilization(self,  datetime_mock_serializer, datetime_mock_service):
        self.client.force_authenticate(user=self.user)
        datetime_mock_service.date.today.return_value = date(2023, 2, 28)
        datetime_mock_service.timedelta = timedelta
        datetime_mock_serializer.date.today.return_value = date(2023, 2, 28)
        datetime_mock_serializer.timedelta = timedelta
        url = reverse('v1:project:project-allocation-detail',
                      kwargs={'allocation_id': self.allocation.id})
        data = {
            "user": self.user.id,
            "utilization": 100,
            "end_date": "2023-06-30",
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.REQUESTED_UTILIZATION_GREATER_THAN_POSITION_UTILIZATION)

    @patch('project.services.datetime')
    @patch('project.serializers.datetime')
    def test_project_allocation_beyond_position_differ_utilization(self,  datetime_mock_serializer,
                                                                   datetime_mock_service):
        self.client.force_authenticate(user=self.user)
        datetime_mock_service.date.today.return_value = date(2023, 2, 28)
        datetime_mock_service.timedelta = timedelta

        datetime_mock_serializer.date.today.return_value = date(2023, 2, 28)
        datetime_mock_serializer.timedelta = timedelta
        url = reverse('v1:project:project-allocation-detail',
                      kwargs={'allocation_id': self.allocation.id})
        data = {
            "user": self.user.id,
            "utilization": 50,
            "end_date": "2025-01-30",
        }
        response = self.client.put(url, data, format='json')
        self.allocation.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.ALLOCATION_IS_BEYOND_POSITION_DATE_RANGE)

    @patch('project.services.datetime')
    @patch('project.serializers.datetime')
    def test_other_talent_already_allocated(self,  datetime_mock_serializer, datetime_mock_service):
        self.client.force_authenticate(user=self.user)
        datetime_mock_service.date.today.return_value = date(2023, 2, 28)
        datetime_mock_service.timedelta = timedelta

        datetime_mock_serializer.date.today.return_value = date(2023, 2, 28)
        datetime_mock_serializer.timedelta = timedelta
        url = reverse('v1:project:project-allocation-detail',
                      kwargs={'allocation_id': self.allocation.id})

        ProjectAllocation.objects.create(user=self.user1, position=self.position,
                                         utilization=60,
                                         start_date="2023-01-01",
                                         end_date="2023-05-20", kt_period=10)
        data = {
            "user": self.user.id,
            "utilization": 30,
            "end_date": "2023-12-21",
        }
        response = self.client.put(url, data, format='json')
        self.allocation.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.OTHER_TALENT_IS_ALREADY_ALLOCATED_IN_GIVEN_DATE_RANGE)


class EditProjectAllocationRequestTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_REQUEST_PERMISSIONS[PermissionKeys.PUT][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.ADMIN_NOTIFICATION_PERMISSION)
        cls.user.user_permissions.add(permission)

        cls.user1 = User.objects.create_user(employee_id=5, email='user5@company.io', first_name='Foo5',
                                             last_name='Bar5')
        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        project = Project.objects.create(name='demo1', status=Project.Status.HOT, city='Bangalore', country='India',
                                         client=client, start_date='2023-01-01')
        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(project=project, role=role)
        cls.position = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2030-12-01'
        )

        cls.allocation = ProjectAllocation.objects.create(user=cls.user, position=cls.position,
                                                          utilization=60,
                                                          start_date="2023-01-01",
                                                          end_date="2030-01-25", kt_period=10)

    def test_invalid_project_allocation_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request-detail',
                      kwargs={'allocation_request_id': 20})
        data = {
            "utilization": 50,
            "end_date": "2029-03-22"
        }
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.INVALID_PROJECT_ALLOCATION_ID)

    def test_edit_project_allocation_request(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request-detail',
                      kwargs={'allocation_request_id': self.allocation.id})
        data = {
            "utilization": 50,
            "end_date": "2029-03-22"
        }
        response = self.client.put(url, data, format='json')
        allocation_request = ProjectAllocationRequest.objects.first()
        notification = Notification.objects.filter(
            object_id=allocation_request.id).first()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(allocation_request.end_date.strftime(
            '%Y-%m-%d'), data['end_date'])
        self.assertEqual(allocation_request.start_date, datetime.date.today())
        self.assertEqual(allocation_request.utilization, data['utilization'])
        self.assertEqual(allocation_request.allocation, self.allocation)
        self.assertEqual(allocation_request.id, notification.object_id)

    def test_project_allocation_beyond_position(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request-detail',
                      kwargs={'allocation_request_id': self.allocation.id})
        data = {
            "utilization": 50,
            "end_date": "2044-01-22",
        }
        response = self.client.put(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.ALLOCATION_IS_BEYOND_POSITION_DATE_RANGE)

    @patch('project.services.datetime')
    @patch('project.serializers.datetime')
    def test_edit_project_allocation_beyond_utilization(self,  datetime_mock_serializer, datetime_mock_service):
        self.client.force_authenticate(user=self.user)
        datetime_mock_service.date.today.return_value = date(2023, 2, 28)
        datetime_mock_service.timedelta = timedelta

        datetime_mock_serializer.date.today.return_value = date(2023, 2, 28)
        datetime_mock_serializer.timedelta = timedelta
        url = reverse('v1:project:project-allocation-request-detail',
                      kwargs={'allocation_request_id': self.allocation.id})
        data = {
            "utilization": 80,
            "end_date": "2024-01-22"
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.REQUESTED_UTILIZATION_GREATER_THAN_POSITION_UTILIZATION)


class PatchProjectAllocationRequestTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_REQUEST_PERMISSIONS[PermissionKeys.PUT][0])
        cls.user.user_permissions.add(permission)

        cls.user1 = User.objects.create_user(employee_id=5, email='user5@company.io', first_name='Foo5',
                                             last_name='Bar5')
        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        cls.project = Project.objects.create(name='demo1', status=Project.Status.HOT, city='Bangalore', country='India',
                                             client=client, start_date='2023-01-01')
        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(
            project=cls.project, role=role)
        cls.position = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-12-01'
        )
        cls.project_allocation_request = ProjectAllocationRequest.objects.create(user=cls.user, position=cls.position,
                                                                                 utilization=60,
                                                                                 start_date="2023-01-01",
                                                                                 end_date="2023-01-31", kt_period=10)

        other_data = {
            "project_id": cls.project.id,
            "requests_user": cls.project_allocation_request.user.full_name,
        }

        cls.notification = Notification.objects.create(
            notification_type=Notification.NotificationType.NEW_ALLOCATION_REQUEST,
            sender=cls.user,
            receiver=cls.user1,
            object_id=cls.project_allocation_request.id,
            content_type=ContentType.objects.get_for_model(
                cls.project_allocation_request),
            object=cls.project_allocation_request,
            json_data=other_data)

    def test_invalid_allocation_request(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request-detail',
                      kwargs={'allocation_request_id': 10})
        data = {
            "status": "APPROVED"
        }
        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            (response.data['detail']), ErrorMessages.INVALID_PROJECT_ALLOCATION_REQUEST_ID)

    def test_project_allocation_denied_request(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request-detail',
                      kwargs={'allocation_request_id': self.project_allocation_request.id})
        data = {
            "status": "DENIED"
        }
        response = self.client.patch(url, data, format='json')

        project_allocation_request = ProjectAllocationRequest.objects.filter(id=self.project_allocation_request.id). \
            first()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(project_allocation_request.status,
                         ProjectAllocationRequest.Status.DENIED)

    def test_project_allocation_approved_new_request(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request-detail',
                      kwargs={'allocation_request_id': self.project_allocation_request.id})
        data = {
            "status": "APPROVED"
        }
        response = self.client.patch(url, data, format='json')
        self.project_allocation_request.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            self.project_allocation_request.status, data['status'])
        self.assertEqual(self.project_allocation_request.handler, self.user)

    def test_project_allocation_other_allocated_new_request(self):
        ProjectAllocation.objects.create(user=self.user1, position=self.position,
                                         utilization=60,
                                         start_date="2023-01-01",
                                         end_date="2023-01-25", kt_period=10)
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request-detail',
                      kwargs={'allocation_request_id': self.project_allocation_request.id})
        data = {
            "status": "APPROVED"
        }

        response = self.client.patch(url, data, format='json')
        self.project_allocation_request.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.OTHER_TALENT_IS_ALREADY_ALLOCATED_IN_GIVEN_DATE_RANGE)

    def test_project_allocation_other_allocated_edited_request(self):
        allocation = ProjectAllocation.objects.create(
            user=self.user1, position=self.position,
            utilization=60,
            start_date=datetime.date.today() - datetime.timedelta(days=30),
            end_date=datetime.date.today() + datetime.timedelta(days=1), kt_period=10)
        project_allocation_request = ProjectAllocationRequest.objects.create(
            allocation=allocation,
            user=self.user,
            position=self.position,
            utilization=60,
            start_date=datetime.date.today() - datetime.timedelta(
                days=20),
            end_date=datetime.date.today() + datetime.timedelta(
                days=10), kt_period=10)
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request-detail',
                      kwargs={'allocation_request_id': project_allocation_request.id})
        data = {
            "status": "APPROVED"
        }
        response = self.client.patch(url, data, format='json')
        self.project_allocation_request.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.OTHER_TALENT_IS_ALREADY_ALLOCATED_IN_GIVEN_DATE_RANGE)

    def test_project_allocation_edited_request_differ_utilization(self):
        allocation = ProjectAllocation.objects.create(user=self.user, position=self.position,
                                                      utilization=60,
                                                      start_date="2023-01-01",
                                                      end_date="2023-01-25", kt_period=10)

        project_allocation_request = ProjectAllocationRequest.objects.create(allocation=allocation,
                                                                             user=self.user,
                                                                             position=self.position,
                                                                             utilization=50,
                                                                             start_date="2023-01-01",
                                                                             end_date="2023-01-31", kt_period=0)

        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request-detail',
                      kwargs={'allocation_request_id': project_allocation_request.id})
        data = {
            "status": "APPROVED"
        }
        response = self.client.patch(url, data, format='json')
        project_allocation_request.refresh_from_db()
        new_allocation = ProjectAllocation.objects.all()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(project_allocation_request.status, data['status'])
        self.assertEqual(new_allocation[1].end_date,
                         project_allocation_request.end_date)

    def test_project_allocation_edited_request_same_utilization(self):
        allocation = ProjectAllocation.objects.create(user=self.user, position=self.position,
                                                      utilization=60,
                                                      start_date="2023-01-01",
                                                      end_date="2023-01-25", kt_period=10)
        project_allocation_request = ProjectAllocationRequest.objects.create(allocation=allocation,
                                                                             user=self.user,
                                                                             position=self.position,
                                                                             utilization=60,
                                                                             start_date="2023-01-01",
                                                                             end_date="2023-01-31", kt_period=10)

        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-request-detail',
                      kwargs={'allocation_request_id': project_allocation_request.id})
        data = {
            "status": "APPROVED"
        }
        response = self.client.patch(url, data, format='json')
        project_allocation_request.refresh_from_db()
        allocation.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(project_allocation_request.status, data['status'])
        self.assertEqual(allocation.end_date.strftime('%Y-%m-%d'),
                         project_allocation_request.end_date.strftime('%Y-%m-%d'))


class GetNotificationTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_REQUEST_PERMISSIONS[PermissionKeys.DELETE][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.NOTIFICATION_PERMISSIONS[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)

        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        project = Project.objects.create(name='demo1', status=Project.Status.HOT, city='Bangalore', country='India',
                                         client=client, start_date='2023-01-01')
        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(project=project, role=role)
        cls.position = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-05-01')
        user1 = User.objects.create_user(
            employee_id=5, email='user5@company.io', first_name='Foo5', last_name='Bar5')
        cls.project_allocation_request = ProjectAllocationRequest.objects.create(user=cls.user, position=cls.position,
                                                                                 utilization=60,
                                                                                 start_date="2023-04-15",
                                                                                 end_date="2023-04-20", kt_period=10)
        other_data = {
            "project_id": project.id,
            "requests_user": cls.project_allocation_request.user.full_name,
        }
        cls.notification = Notification.objects.create(
            notification_type=Notification.NotificationType.NEW_ALLOCATION_REQUEST,
            sender=cls.user,
            receiver=user1,
            object_id=cls.project_allocation_request.id,
            content_type=ContentType.objects.get_for_model(
                cls.project_allocation_request),
            object=cls.project_allocation_request,
            json_data=other_data)

    def test_retrieve_notification(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:notification')
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.NOTIFICATIONS], [])


class ReadNotificationTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_REQUEST_PERMISSIONS[PermissionKeys.DELETE][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.NOTIFICATION_PERMISSIONS[PermissionKeys.PATCH][0])
        cls.user.user_permissions.add(permission)

        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        project = Project.objects.create(name='demo1', status=Project.Status.HOT, city='Bangalore', country='India',
                                         client=client, start_date='2023-01-01')
        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(project=project, role=role)
        cls.position = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-05-01')
        user1 = User.objects.create_user(
            employee_id=5, email='user5@company.io', first_name='Foo5', last_name='Bar5')
        cls.project_allocation_request = ProjectAllocationRequest.objects.create(user=cls.user, position=cls.position,
                                                                                 utilization=60,
                                                                                 start_date="2023-04-15",
                                                                                 end_date="2023-04-20", kt_period=10)
        other_data = {
            "project_id": project.id,
            "requests_user": cls.project_allocation_request.user.full_name,
        }
        cls.notification1 = Notification.objects.create(
            notification_type=Notification.NotificationType.NEW_ALLOCATION_REQUEST,
            sender=user1,
            receiver=cls.user,
            object_id=cls.project_allocation_request.id,
            content_type=ContentType.objects.get_for_model(
                cls.project_allocation_request),
            object=cls.project_allocation_request,
            json_data=other_data)
        cls.notification2 = Notification.objects.create(
            notification_type=Notification.NotificationType.DELETE_ALLOCATION,
            sender=user1,
            receiver=cls.user,
            object_id=cls.project_allocation_request.id,
            content_type=ContentType.objects.get_for_model(
                cls.project_allocation_request),
            object=cls.project_allocation_request,
            json_data=other_data)
        cls.notification3 = Notification.objects.create(
            notification_type=Notification.NotificationType.APPROVED_ALLOCATION_CHANGE_REQUEST,
            sender=user1,
            receiver=cls.user,
            object_id=cls.project_allocation_request.id,
            content_type=ContentType.objects.get_for_model(
                cls.project_allocation_request),
            object=cls.project_allocation_request,
            json_data=other_data)

    def test_read_notification(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:notification-detail',
                      kwargs={'notification_id': self.notification1.id})
        response = self.client.patch(url, format='json')

        self.notification1.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.notification1.unseen, False)

    def test_invalid_notification_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:notification-detail',
                      kwargs={'notification_id': 1000})
        response = self.client.patch(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'],
                         ErrorMessages.INVALID_NOTIFICATION_ID)

    def test_read_all_notifications(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:notification-mark-all-read')
        response = self.client.patch(url, format='json')

        self.notification2.refresh_from_db()
        self.notification3.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.notification2.unseen, False)
        self.assertEqual(self.notification3.unseen, False)


class DeleteProjectAllocateTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_PERMISSIONS[PermissionKeys.DELETE][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.ACCOUNT_MANAGER_PERMISSION)
        cls.user.user_permissions.add(permission)

        cls.user1 = User.objects.create_user(employee_id=5, email='user5@company.io', first_name='Foo5',
                                             last_name='Bar5')

        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        cls.project = Project.objects.create(name='demo1', status=Project.Status.HOT, city='Bangalore', country='India',
                                             client=client, start_date='2023-01-01', account_manager=cls.user1)
        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(
            project=cls.project, role=role)
        cls.position = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-05-01'
        )

        active_project = Project.objects.create(name='active_demo1', status=Project.Status.ACTIVE, city='Bangalore',
                                                country='India',
                                                client=client, start_date='2023-01-01')
        project_role = ProjectRole.objects.create(
            project=active_project, role=role)
        cls.position_active = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-02-01', end_date='2023-05-01'
        )

        closed_project = Project.objects.create(name='closed_demo1', status=Project.Status.CLOSED, city='Bangalore',
                                                country='India',
                                                client=client, start_date='2023-01-01')
        project_role = ProjectRole.objects.create(
            project=closed_project, role=role)
        cls.position_closed = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-02-01', end_date='2023-05-01'
        )
        cls.allocation = ProjectAllocation.objects.create(user=cls.user, position=cls.position,
                                                          utilization=60,
                                                          start_date="2023-01-01",
                                                          end_date="2023-01-25", kt_period=10)

    def test_delete_project_allocation(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-detail',
                      kwargs={'allocation_id': self.allocation.id})
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(len(Notification.objects.all()), 1)

    def test_invalid_project_allocation_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-allocation-detail',
                      kwargs={'allocation_id': 10})
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.INVALID_PROJECT_ALLOCATION_ID)


class DeleteProjectPositionTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.ACCOUNT_MANAGER_PERMISSION)
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PROJECT_POSITION_PERMISSIONS[PermissionKeys.DELETE][0])
        cls.user.user_permissions.add(permission)

        cls.user1 = User.objects.create_user(employee_id=5, email='user5@company.io', first_name='Foo5',
                                             last_name='Bar5')

        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        cls.project = Project.objects.create(name='demo1', status=Project.Status.HOT, city='Bangalore', country='India',
                                             client=client, start_date='2023-01-01', account_manager=cls.user1)
        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(
            project=cls.project, role=role)
        cls.position = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-05-01'
        )

        active_project = Project.objects.create(name='active_demo1', status=Project.Status.ACTIVE, city='Bangalore',
                                                country='India',
                                                client=client, start_date='2023-01-01')
        project_role = ProjectRole.objects.create(
            project=active_project, role=role)
        cls.position_active = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-02-01', end_date='2023-05-01'
        )

        closed_project = Project.objects.create(name='closed_demo1', status=Project.Status.CLOSED, city='Bangalore',
                                                country='India',
                                                client=client, start_date='2023-01-01')
        project_role = ProjectRole.objects.create(
            project=closed_project, role=role)
        cls.position_closed = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-02-01', end_date='2023-05-01'
        )
        cls.empty_position = ProjectPosition.objects.create(
            project_role=project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-02-01', end_date='2023-12-01'
        )
        cls.allocation = ProjectAllocation.objects.create(user=cls.user, position=cls.position,
                                                          utilization=60,
                                                          start_date="2023-01-01",
                                                          end_date="2023-01-25", kt_period=10)

    def test_delete_project_position(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-position-detail',
                      kwargs={'position_id': self.empty_position.id})
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_allocated_to_position(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-position-detail',
                      kwargs={'position_id': self.position.id})
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data['detail'], ErrorMessages.USERS_ALLOCATED_TO_THIS_POSITION)

    def test_invalid_project_position_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-position-detail',
                      kwargs={'position_id': 1000})
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'],
                         ErrorMessages.INVALID_POSITION_ID)


class DeleteProjectRoleTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_ALLOCATION_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.ACCOUNT_MANAGER_PERMISSION)
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PROJECT_POSITION_PERMISSIONS[PermissionKeys.DELETE][0])
        cls.user.user_permissions.add(permission)

        cls.user1 = User.objects.create_user(employee_id=5, email='user5@company.io', first_name='Foo5',
                                             last_name='Bar5')

        client = Client.objects.create(
            name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        cls.project = Project.objects.create(name='demo1', status=Project.Status.HOT, city='Bangalore', country='India',
                                             client=client, start_date='2023-01-01', account_manager=cls.user1)
        role, _ = Role.objects.get_or_create(name='Role')
        cls.project_role = ProjectRole.objects.create(
            project=cls.project, role=role)
        cls.position = ProjectPosition.objects.create(
            project_role=cls.project_role, utilization=50, experience_range_start=2, experience_range_end=4,
            start_date='2023-01-01', end_date='2023-05-01'
        )
        cls.allocation = ProjectAllocation.objects.create(user=cls.user, position=cls.position,
                                                          utilization=60,
                                                          start_date="2023-01-01",
                                                          end_date="2023-01-25", kt_period=10)

    def test_delete_project_role(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-role',
                      kwargs={'project_role_id': self.project_role.id})
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_invalid_project_role_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:project:project-role',
                      kwargs={'project_role_id': 1000})
        response = self.client.delete(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'],
                         ErrorMessages.INVALID_PROJECT_ROLE_ID)


class UpdateProjectStatusCommand(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.PROJECT_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(
            PermissionKeys.PRIVILEGED_STATUS_PERMISSION)
        cls.user.user_permissions.add(permission)

        cls.client = Client.objects.create(name='Test', city='Bangalore', country='India', start_date='2020-01-10',
                                           account_manager=cls.user)

        cls.project1 = Project.objects.create(
            name="Past Project",
            client_id=cls.client.id,
            status="ACTIVE",
            start_date='2023-01-01',
            end_date='2024-02-05',
            account_manager_id=cls.user.id
        )

        cls.project2 = Project.objects.create(
            name="Future Project",
            client_id=cls.client.id,
            status="ACTIVE",
            start_date='2023-01-01',
            end_date='2024-04-05',
            account_manager_id=cls.user.id
        )

    @patch('project.management.commands.update_project_status.datetime')
    def test_update_project_status(self, datetime_mock):
        self.client.force_authenticate(user=self.user)

        datetime_mock.date.today.return_value = date(2024, 3, 6)
        call_command('update_project_status')

        project1 = Project.objects.filter(name='Past Project').first()
        project2 = Project.objects.filter(name='Future Project').first()

        self.assertEqual(project1.status, 'CLOSED')
        self.assertEqual(project2.status, 'ACTIVE')
