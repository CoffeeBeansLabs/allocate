import logging

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from client.constants import ResponseKeys, PermissionKeys, ErrorMessages
from client.models import Client
from common.models import Industry
from project.models import Project
from user.models import User
from utils.permissions import get_permission_object


class BaseTestCase(APITestCase):

    user = None

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        logging.disable(logging.CRITICAL)

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(employee_id=1, email='user@company.com', first_name='Foo', last_name='Bar')


class AddClientTests(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.industry, _ = Industry.objects.get_or_create(name='Technology')
        permission = get_permission_object(PermissionKeys.CLIENT_PERMISSIONS[PermissionKeys.POST][0])
        cls.user.user_permissions.add(permission)

    def test_add_client(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:client:client')
        data = {
            'name': 'Test Client',
            'city': 'Bangalore',
            'country': 'India',
            'status': Client.Status.ACTIVE,
            'industry': self.industry.id,
            'accountManager': self.user.id,
            'startDate': '2022-01-01',
            'pocs': [
                {
                    'name': 'POC 1',
                    'email': 'poc1@gmail.com',
                    'phoneNumber': '9191919191'
                },
                {
                    'name': 'POC 2',
                    'email': 'poc2@gmail.com',
                    'phoneNumber': '9292929292'
                }

            ]
        }
        response = self.client.post(url, data, format='json')
        client = Client.objects.filter(name='Test Client').first()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data[ResponseKeys.CLIENT]['id'], client.id)
        self.assertEqual(client.industry.id, self.industry.id)
        self.assertEqual(client.account_manager.id, self.user.id)
        self.assertEqual(client.created_by.id, self.user.id)
        self.assertEqual(client.pocs.count(), 2)


class EditClientTests(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(PermissionKeys.CLIENT_PERMISSIONS[PermissionKeys.PUT][0])
        cls.user.user_permissions.add(permission)

        permission = get_permission_object(PermissionKeys.MARK_DORMANT_PERMISSION)
        cls.user.user_permissions.add(permission)

        cls.industry, _ = Industry.objects.get_or_create(name='Technology')
        client = Client.objects.create(name='Test', city='Bangalore', country='India', start_date='2020-01-10',
                                       account_manager=cls.user, status=Client.Status.ACTIVE)
        cls.client_ = client
        cls.project = Project.objects.create(name='Junk 1', status=Project.Status.ACTIVE, city='Bangalore',
                                             country='India', client=client, start_date='2020-01-01')

    def test_edit_client(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:client:client-detail', kwargs={'client_id': self.client_.id})
        data = {
            'name': 'Updated',
            'city': 'Pune',
            'country': 'INDIA',
            'status': Client.Status.ACTIVE,
            'industry': self.industry.id,
            'accountManager': None,
            'startDate': '2022-01-01',
            'pocs': [
                {
                    'name': 'POC 1',
                    'email': 'poc1@gmail.com',
                    'phoneNumber': '9191919191'
                }
            ]
        }
        response = self.client.put(url, data, format='json')
        self.client_.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.CLIENT]['id'], self.client_.id)
        self.assertEqual(self.client_.name, 'Updated')
        self.assertEqual(self.client_.status, Client.Status.ACTIVE)
        self.assertEqual(self.client_.city, 'Pune')
        self.assertEqual(self.client_.country, 'INDIA')
        self.assertEqual(self.client_.start_date.strftime('%Y-%m-%d'), '2022-01-01')
        self.assertEqual(self.client_.industry.id, self.industry.id)
        self.assertIsNone(self.client_.account_manager)
        self.assertEqual(self.client_.pocs.count(), 1)

    def test_edit_client_status_dormant(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:client:client-detail', kwargs={'client_id': self.client_.id})
        data = {
            'name': 'Updated',
            'city': 'Pune',
            'country': 'INDIA',
            'status': Client.Status.DORMANT,
            'industry': self.industry.id,
            'accountManager': None,
            'startDate': '2022-01-01',
            'pocs': [
                {
                    'name': 'POC 1',
                    'email': 'poc1@gmail.com',
                    'phoneNumber': '9191919191'
                }
            ]
        }
        response = self.client.put(url, data, format='json')
        self.client_.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], ErrorMessages.ALL_PROJECT_RELATED_TO_CLIENT_IS_NOT_CLOSED)

    def test_edit_client_invalid_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:client:client-detail', kwargs={'client_id': 0})
        data = {
            'name': 'Updated',
            'city': 'Pune',
            'country': 'INDIA',
            'status': Client.Status.DORMANT,
            'industry': self.industry.id,
            'accountManager': None,
            'startDate': '2022-01-01',
            'pocs': [
                {
                    'name': 'POC 1',
                    'email': 'poc1@gmail.com',
                    'phoneNumber': '9191919191'
                }
            ]

        }
        response = self.client.put(url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], ErrorMessages.INVALID_CLIENT_ID)

    def test_edit_client_unauthorized_status_update(self):
        permission = get_permission_object(PermissionKeys.MARK_DORMANT_PERMISSION)
        self.user.user_permissions.remove(permission)

        self.client.force_authenticate(user=self.user)
        url = reverse('v1:client:client-detail', kwargs={'client_id': self.client_.id})
        data = {
            'name': 'Updated',
            'city': 'Pune',
            'country': 'INDIA',
            'status': Client.Status.DORMANT,
            'industry': self.industry.id,
            'accountManager': None,
            'startDate': '2022-01-01',
            'pocs': [
                {
                    'name': 'POC 1',
                    'email': 'poc1@gmail.com',
                    'phoneNumber': '9191919191'
                }
            ]
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'], ErrorMessages.DORMANT_PERMISSION_DENIED)


class ListClientTests(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(PermissionKeys.CLIENT_PERMISSIONS[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)

        industry1 = Industry.objects.create(name='Biotechnology')
        industry2 = Industry.objects.create(name='junk')

        Client.objects.create(name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        Client.objects.create(name='Junk 1', city='Pune', country='India', start_date='2022-02-02',
                              status=Client.Status.DORMANT, industry=industry1)
        Client.objects.create(name='Junk 2', city='Pune', country='India', start_date='2022-02-02',
                              status=Client.Status.ACTIVE, industry=industry1)
        Client.objects.create(name='Dummy', city='Hyderabad', country='India', start_date='2018-01-01',
                              status=Client.Status.ACTIVE, industry=industry2)

    def test_list_clients(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:client:client')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 3)

    def test_list_clients_pagination(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:client:client')
        data = {'page': 1, 'size': 2}
        response = self.client.get(url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data[ResponseKeys.CLIENTS]), 2)
        self.assertEqual(response.data[ResponseKeys.COUNT], 3)

    def test_list_clients_filter(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:client:client')
        data = {'startDateStart': '2020-01-01', 'startDateEnd': '2022-11-11', 'status': Client.Status.DORMANT}
        response = self.client.get(url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 1)

    def test_list_clients_search(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:client:client')
        data = {'search': 'junk'}
        response = self.client.get(url, data=data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.COUNT], 2)


class RetrieveClientTests(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(PermissionKeys.CLIENT_PERMISSIONS[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)

        client = Client.objects.create(name='Test', city='Bangalore', country='India', start_date='2020-01-10')
        cls.client_ = client

    def test_retrieve_client(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:client:client-detail', kwargs={'client_id': self.client_.id})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.CLIENT]['id'], self.client_.id)

    def test_retrieve_client_invalid_id(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:client:client-detail', kwargs={'client_id': 0})
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], ErrorMessages.INVALID_CLIENT_ID)


class ClientCreationDropdownsTest(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(PermissionKeys.CLIENT_CREATION_DROPDOWN_PERMISSIONS[PermissionKeys.GET][0])
        cls.user.user_permissions.add(permission)

        Industry.objects.get_or_create(name='Technology')
        user1 = User.objects.create_user(employee_id=2, email='user1@example.com', first_name='Foo1',
                                         last_name='Bar1', status='Active')
        user2 = User.objects.create_user(employee_id=3, email='user2@example.com', first_name='Foo2',
                                         last_name='Bar2', status='Active')

        permission = get_permission_object(PermissionKeys.ACCOUNT_MANAGER_PERMISSION)
        permission.user_set.add(*[user1, user2])

    def test_client_creation_dropdowns(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('v1:client:client-creation-dropdowns')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data[ResponseKeys.DROPDOWNS][ResponseKeys.STATUS]), 2)
        self.assertEqual(len(response.data[ResponseKeys.DROPDOWNS][ResponseKeys.INDUSTRIES]), 1)
        self.assertEqual(len(response.data[ResponseKeys.DROPDOWNS][ResponseKeys.ACCOUNT_MANAGERS]), 2)
