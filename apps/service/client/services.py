from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

from client.constants import RequestKeys, ErrorMessages, PermissionKeys, ResponseKeys
from client.filters import ClientFilter
from client.models import Client, ClientPOC
from common.models import Industry
from helpers.exceptions import InvalidRequest
from project.models import Project
from user.constants import StatusKeys
from user.models import User


class ClientService:

    @transaction.atomic
    def create_client(self, data, request_user):
        """
        Method to create a client.
        """
        pocs = data.pop(RequestKeys.POCS, [])
        client = Client.objects.create(**data, created_by=request_user)
        if pocs:
            pocs = [ClientPOC(**poc, client=client) for poc in pocs]
            ClientPOC.objects.bulk_create(pocs)
        return client

    @transaction.atomic
    def edit_client(self, client_id, data, request_user):
        """
        Method to edit a client.
        """
        client = Client.objects.prefetch_related('projects').filter(id=client_id)
        if not client:
            raise InvalidRequest(ErrorMessages.INVALID_CLIENT_ID)

        status = data.get(RequestKeys.STATUS)
        if status == Client.Status.DORMANT:
            if not request_user.has_perm(PermissionKeys.MARK_DORMANT_PERMISSION):
                raise PermissionDenied(ErrorMessages.DORMANT_PERMISSION_DENIED)
            projects = client[0].projects.filter(~Q(status=Project.Status.CLOSED))
            if projects.exists():
                raise InvalidRequest(ErrorMessages.ALL_PROJECT_RELATED_TO_CLIENT_IS_NOT_CLOSED)

        pocs = data.pop(RequestKeys.POCS, [])
        client.update(**data, modified_time=timezone.now())
        client = client.first()
        client.pocs.all().delete()
        if pocs:
            pocs = [ClientPOC(**poc, client=client) for poc in pocs]
            ClientPOC.objects.bulk_create(pocs)

        return client

    def list_clients(self, filters):
        """
        Method to list clients.
        """
        clients = Client.objects.select_related('industry').all()
        clients = ClientFilter(filters, clients).qs
        clients = clients.order_by('-start_date')
        return clients

    def retrieve_client(self, client_id):
        """
        Method to retrieve client details by ID.
        """
        client = Client.objects.filter(id=client_id).select_related('industry', 'account_manager').first()
        if not client:
            raise InvalidRequest(ErrorMessages.INVALID_CLIENT_ID)
        return client

    def get_client_creation_dropdowns(self):
        """
        Method to return dropdowns required while adding/editing clients.
        """
        status = [{'id': identifier, 'name': name} for identifier, name in Client.Status.choices]
        industries = Industry.objects.all().order_by('name')  # Account Manager Role_id=1
        account_managers = User.objects.filter_by_permission(PermissionKeys.ACCOUNT_MANAGER_PERMISSION).filter(
            status=StatusKeys.ACTIVE) \
            .order_by('first_name', 'last_name')
        return {
            ResponseKeys.STATUS: status,
            ResponseKeys.INDUSTRIES: industries,
            ResponseKeys.ACCOUNT_MANAGERS: account_managers
        }
