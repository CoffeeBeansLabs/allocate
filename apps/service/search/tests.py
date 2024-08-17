import logging
from datetime import datetime
from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from client.models import Client
from common.models import Skill
from project.models import Project, ProjectRole, ProjectPosition, ProjectAllocation, ProjectPositionSkills
from search.constants import PermissionKeys, ResponseKeys, Weights
from user.models import User, Role, ProficiencyMapping, LeavePlans
from utils.permissions import get_permission_object


class BaseTestCase(APITestCase):
    user = None

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        logging.disable(logging.CRITICAL)

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(employee_id=1, email='user@company.io', first_name='Foo', last_name='Bar')


class SearchTalentTests(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(PermissionKeys.SEARCH_TALENT_PERMISSIONS[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(PermissionKeys.SEARCH_TALENT_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

        cls.client_ = Client.objects.create(name='Test', city='Bangalore', country='India', start_date='2020-01-10',
                                            account_manager=cls.user)
        project = Project.objects.create(name='Junk', status=Project.Status.ACTIVE, city='Bangalore',
                                         country='India', client=cls.client_, start_date='2020-01-01')

        role, _ = Role.objects.get_or_create(name='Role')
        project_role = ProjectRole.objects.create(project=project, role=role)
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
                                        career_start_date='2015-01-01', work_location='Bangalore')
        ProficiencyMapping.objects.create(user=cls.user2, skill=cls.skill1, rating=2)
        ProficiencyMapping.objects.create(user=cls.user2, skill=cls.skill2, rating=4)

        cls.user3 = User.objects.create(employee_id=13, email='user3@company.io', first_name='Foo3', last_name='Bar3',
                                        is_active=False)

        ProjectAllocation.objects.create(user=cls.user1, position=cls.position1, utilization=50,
                                         start_date='2023-01-01', end_date='2023-01-31')
        ProjectAllocation.objects.create(user=cls.user2, position=cls.position2, utilization=70,
                                         start_date='2023-07-01', end_date='2023-07-31')

        LeavePlans.objects.create(user=cls.user1, from_date='2023-02-06', to_date='2023-02-10', duration=5,
                                  leave_type='junk', approval_status='Approved')
        cls.user4 = User.objects.create(employee_id=14, email='user4@company.io', first_name='Foo4', last_name='Bar4',
                                        career_start_date='2019-07-15', work_location='Mumbai')
        ProficiencyMapping.objects.create(user=cls.user4, skill=cls.skill2, rating=1)

    @patch('search.services.timezone')
    def test_search_talent(self, mock):
        mock.now.return_value = datetime.strptime('2023-01-01', '%Y-%m-%d')

        role, _ = Role.objects.get_or_create(name='Role1')
        project = Project.objects.create(name='Junk1', status=Project.Status.SIGNED, city='Bangalore',
                                         country='India', client=self.client_, start_date='2020-01-01')
        project_role = ProjectRole.objects.create(project=project, role=role)
        position = ProjectPosition.objects.create(project_role=project_role, utilization=70, experience_range_start=2,
                                                  experience_range_end=5, start_date='2023-01-15',
                                                  end_date='2023-02-14')
        ProjectPositionSkills.objects.create(position=position, skill=self.skill1, priority=1)

        self.client.force_authenticate(user=self.user)
        url = reverse('v1:search:search-talent')
        data = {
            'position': position.id,
            'relatedSuggestions': True,
            'responseDateStart': '2023-01-15',
            'responseDateEnd': '2023-02-15'
        }
        response = self.client.get(url, data, format='json')

        expected_match_1 = int(round(0.3 * Weights.AVAILABILITY + 1 * Weights.SKILL + 1 * Weights.PROFICIENCY +
                                     1 * Weights.EXPERIENCE, 0))
        expected_match_2 = int(round(1 * Weights.AVAILABILITY + 1 * Weights.SKILL + 0.5 * Weights.PROFICIENCY +
                                     0.25 * Weights.EXPERIENCE, 0))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 2)
        self.assertAlmostEqual(int(response.data[ResponseKeys.TALENTS][0]['match_percent'][:2]), expected_match_1)
        self.assertAlmostEqual(int(response.data[ResponseKeys.TALENTS][1]['match_percent'][:2]), expected_match_2)
        self.assertEqual(len(response.data[ResponseKeys.TALENTS][0]['allocation']), 1)
        self.assertEqual(len(response.data[ResponseKeys.TALENTS][0]['leaves']), 1)
        self.assertEqual(len(response.data[ResponseKeys.TALENTS][1]['allocation']), 0)
        self.assertEqual(len(response.data[ResponseKeys.TALENTS][1]['leaves']), 0)

    @patch('search.services.timezone')
    def test_quick_search_talent(self, mock):
        mock.now.return_value = datetime.strptime('2023-01-01', '%Y-%m-%d')

        role, _ = Role.objects.get_or_create(name='Role1')

        self.client.force_authenticate(user=self.user)
        url = reverse('v1:search:quick-search')
        data = {
            'relatedSuggestions': True,
            'responseDateStart': '2023-01-15',
            'responseDateEnd': '2023-02-15',
            "role": role.id,
            "skills": [self.skill1.id],
            "experienceRangeStart": 2,
            "experienceRangeEnd": 5,
            "startDate": "2023-01-15",
            "endDate": "2023-02-14",
            "utilization": 70
        }
        response = self.client.post(url, data, format='json')

        expected_match_1 = int(round(0.3 * Weights.AVAILABILITY + 1 * Weights.SKILL + 1 * Weights.PROFICIENCY +
                                     1 * Weights.EXPERIENCE, 0))
        expected_match_2 = int(round(1 * Weights.AVAILABILITY + 1 * Weights.SKILL + 0.5 * Weights.PROFICIENCY +
                                     0.25 * Weights.EXPERIENCE, 0))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 2)
        self.assertAlmostEqual(int(response.data[ResponseKeys.TALENTS][0]['match_percent'][:2]), expected_match_1)
        self.assertAlmostEqual(int(response.data[ResponseKeys.TALENTS][1]['match_percent'][:2]), expected_match_2)
        self.assertEqual(len(response.data[ResponseKeys.TALENTS][0]['allocation']), 1)
        self.assertEqual(len(response.data[ResponseKeys.TALENTS][0]['leaves']), 1)
        self.assertEqual(len(response.data[ResponseKeys.TALENTS][1]['allocation']), 0)
        self.assertEqual(len(response.data[ResponseKeys.TALENTS][1]['leaves']), 0)

    @patch('search.services.timezone')
    def test_quick_search_on_location(self, mock):
        mock.now.return_value = datetime.strptime('2023-01-01', '%Y-%m-%d')

        role, _ = Role.objects.get_or_create(name='Role1')

        self.client.force_authenticate(user=self.user)
        url = reverse('v1:search:quick-search')
        data = {
            'relatedSuggestions': True,
            'responseDateStart': '2023-01-15',
            'responseDateEnd': '2023-02-15',
            "role": role.id,
            "skills": [self.skill1.id],
            "experienceRangeStart": 2,
            "experienceRangeEnd": 5,
            "startDate": "2023-01-15",
            "endDate": "2023-02-14",
            "utilization": 70,
            "locations": ['Bangalore']
        }
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 2)

        self.assertEqual(response.data[ResponseKeys.TALENTS][0]['work_location'], 'Bangalore')
        self.assertEqual(response.data[ResponseKeys.TALENTS][1]['work_location'], 'Bangalore')

    @patch('search.services.timezone')
    def test_search_talent_on_location(self, mock):
        mock.now.return_value = datetime.strptime('2023-01-01', '%Y-%m-%d')

        role, _ = Role.objects.get_or_create(name='Role1')
        project = Project.objects.create(name='Junk1', status=Project.Status.SIGNED, city='Bangalore',
                                         country='India', client=self.client_, start_date='2020-01-01')
        project_role = ProjectRole.objects.create(project=project, role=role)
        position = ProjectPosition.objects.create(project_role=project_role, utilization=70, experience_range_start=2,
                                                  experience_range_end=5, start_date='2023-01-15',
                                                  end_date='2023-02-14')
        ProjectPositionSkills.objects.create(position=position, skill=self.skill1, priority=1)

        self.client.force_authenticate(user=self.user)
        url = reverse('v1:search:search-talent')
        data = {
            'position': position.id,
            'relatedSuggestions': True,
            'responseDateStart': '2023-01-15',
            'responseDateEnd': '2023-02-15',
            'locations': ['Bangalore']
        }
        response = self.client.get(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 2)
        self.assertEqual(response.data[ResponseKeys.TALENTS][0]['work_location'], 'Bangalore')
        self.assertEqual(response.data[ResponseKeys.TALENTS][1]['work_location'], 'Bangalore')
