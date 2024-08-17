import logging
from unittest import mock

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from authapp.constants import ErrorMessages, PermissionKeys
from authapp.services import LoginService
from user.models import User
from utils.permissions import get_permission_object


class LoginTests(APITestCase):

    user = None

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        logging.disable(logging.CRITICAL)

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(employee_id=1, email='user@company.com', first_name='Foo', last_name='Bar')

        permission = get_permission_object(PermissionKeys.LOGIN_PERMISSION)
        cls.user.user_permissions.add(permission)

        cls.url = reverse('v1:authapp:login')

    def create_patch(self, obj, attr, return_value=None):
        patcher = mock.patch.object(obj, attr)
        self.addCleanup(patcher.stop)
        patch = patcher.start()
        patch.return_value = return_value
        return patch

    def test_login_invalid_code(self):
        data = {'code': 'code'}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['detail'], ErrorMessages.GOOGLE_AUTHENTICATION_FAILED)

    def test_login_invalid_auth_token(self):
        self.create_patch(LoginService, 'get_access_token_google', 'token')

        data = {'code': 'code'}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.data['detail'], ErrorMessages.SOMETHING_WENT_WRONG)

    def test_login_invalid_user(self):
        self.create_patch(LoginService, 'get_access_token_google', 'token')
        self.create_patch(LoginService, 'get_user_info_google', {'email': 'invalid@company.com', 'picture': 'link'})

        data = {'code': 'code'}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['detail'], ErrorMessages.UNAUTHORIZED_LOGIN)

    def test_login_inactive_user(self):
        self.create_patch(LoginService, 'get_access_token_google', 'token')
        self.create_patch(LoginService, 'get_user_info_google', {'email': 'user@company.com', 'picture': 'link'})

        self.user.is_active = False
        self.user.save()

        data = {'code': 'code'}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['detail'], ErrorMessages.UNAUTHORIZED_LOGIN)

    def test_login_unauthorized_role(self):
        self.create_patch(LoginService, 'get_access_token_google', 'token')
        self.create_patch(LoginService, 'get_user_info_google', {'email': 'user@company.com', 'picture': 'link'})

        permission = get_permission_object(PermissionKeys.LOGIN_PERMISSION)
        self.user.user_permissions.remove(permission)

        data = {'code': 'code'}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['detail'], ErrorMessages.UNAUTHORIZED_LOGIN)

    def test_login_success(self):
        self.create_patch(LoginService, 'get_access_token_google', 'token')
        self.create_patch(LoginService, 'get_user_info_google', {'email': 'user@company.com', 'picture': 'link'})

        data = {'code': 'code'}
        response = self.client.post(self.url, data, format='json')
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['id'], self.user.id)
        self.assertEqual(response.data['user']['picture'], 'link')
