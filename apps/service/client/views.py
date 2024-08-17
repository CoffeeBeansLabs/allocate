from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from authapp.permissions import APIPermission
from client.constants import PermissionKeys, ResponseKeys, RequestKeys
from client.serializers import CreateClientRequestSerializer, SetClientResponseSerializer, \
    ListClientsRequestSerializer, ListClientsResponseSerializer, RetrieveClientResponseSerializer, \
    EditClientRequestSerializer, ClientCreationDropdownsResponseSerializer
from client.services import ClientService
from helpers.pagination import paginate


class ClientAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.CLIENT_PERMISSIONS

    @swagger_auto_schema(request_body=CreateClientRequestSerializer(),
                         responses={status.HTTP_201_CREATED: SetClientResponseSerializer()})
    def post(self, request):
        """
        API to create a client.
        """
        service = ClientService()
        request_serializer = CreateClientRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        client = service.create_client(request_serializer.validated_data, request.user)
        response_serializer = SetClientResponseSerializer(client)
        response = {ResponseKeys.CLIENT: response_serializer.data}
        return Response(response, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(query_serializer=ListClientsRequestSerializer(),
                         responses={status.HTTP_200_OK: ListClientsResponseSerializer(many=True)})
    def get(self, request):
        """
        API to list clients.
        """
        service = ClientService()
        request_serializer = ListClientsRequestSerializer(data=request.GET)
        request_serializer.is_valid(raise_exception=True)
        sort_by = request_serializer.data.get(RequestKeys.SORT_BY)
        page = request_serializer.validated_data.pop(RequestKeys.PAGE)
        size = request_serializer.validated_data.pop(RequestKeys.SIZE)
        clients = service.list_clients(request_serializer.validated_data)
        if sort_by == 'name_asc':
            clients = clients.order_by('name')
        if sort_by == 'name_desc':
            clients = clients.order_by('-name')
        if sort_by == 'start_date_asc':
            clients = clients.order_by('start_date')
        if sort_by == 'start_date_desc':
            clients = clients.order_by('-start_date')

        paginated_clients = paginate(clients, page, size)
        response_serializer = ListClientsResponseSerializer(paginated_clients, many=True)
        response = {ResponseKeys.CLIENTS: response_serializer.data, ResponseKeys.COUNT: clients.count()}
        return Response(response, status=status.HTTP_200_OK)


class ClientDetailAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.CLIENT_PERMISSIONS

    @swagger_auto_schema(request_body=EditClientRequestSerializer(),
                         responses={status.HTTP_200_OK: SetClientResponseSerializer()})
    def put(self, request, client_id):
        """
        API to edit a client.
        """
        service = ClientService()
        request_serializer = EditClientRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        client = service.edit_client(client_id, request_serializer.validated_data, request.user)
        response_serializer = SetClientResponseSerializer(client)
        response = {ResponseKeys.CLIENT: response_serializer.data}
        return Response(response, status=status.HTTP_200_OK)

    @swagger_auto_schema(responses={status.HTTP_200_OK: RetrieveClientResponseSerializer()})
    def get(self, request, client_id):
        """
        API to get client details.
        """
        service = ClientService()
        client = service.retrieve_client(client_id)
        response_serializer = RetrieveClientResponseSerializer(client)
        response = {ResponseKeys.CLIENT: response_serializer.data}
        return Response(response, status=status.HTTP_200_OK)


class ClientCreationDropdownsAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.CLIENT_CREATION_DROPDOWN_PERMISSIONS

    @swagger_auto_schema(responses={status.HTTP_200_OK: ClientCreationDropdownsResponseSerializer()})
    def get(self, request):
        """
        API to get dropdowns required while adding/editing clients.
        """
        service = ClientService()
        dropdowns = service.get_client_creation_dropdowns()
        response_serializer = ClientCreationDropdownsResponseSerializer(dropdowns)
        response = {ResponseKeys.DROPDOWNS: response_serializer.data}
        return Response(response, status=status.HTTP_200_OK)
