import logging

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.test import override_settings, TestCase

from unittest.mock import patch

from user.models import User
from common.constants import ResponseKeys


class BaseTestCase(APITestCase):

    user = None

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        logging.disable(logging.CRITICAL)

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            employee_id=1, email='user@company.com', first_name='Foo', last_name='Bar')


class FeatureFlagTests(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

    @override_settings(ASSET_MODULE_FEATURE_FLAG='enabled', ENVIRONMENT='development')
    def test_list_feature_flags_when_enabled(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:common:feature_flags')
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.ASSET_MODULE], True)

    @override_settings(ASSET_MODULE_FEATURE_FLAG='disabled', ENVIRONMENT='development')
    def test_list_feature_flags_when_disabled(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:common:feature_flags')
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.ASSET_MODULE], False)


class HealthCheckTestCase(TestCase):

    @patch('common.service.HealthCheckService.check_database_connection')
    def test_health_check_success(self, mock_db_check):
        mock_db_check.return_value = True
        response = self.client.get(reverse('v1:common:health_check'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected_data = {
            "status": True
        }

        self.assertJSONEqual(response.content, expected_data)

    @patch('common.service.HealthCheckService.check_database_connection')
    def test_health_check_failure(self, mock_db_check):
        mock_db_check.return_value = False
        response = self.client.get(reverse('v1:common:health_check'))
        self.assertEqual(response.status_code,
                         status.HTTP_503_SERVICE_UNAVAILABLE)
        expected_data = {
            "status": False
        }

        self.assertJSONEqual(response.content, expected_data)
