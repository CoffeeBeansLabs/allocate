from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from authapp.permissions import APIPermission
from helpers.pagination import paginate
from project.constants import PermissionKeys, ResponseKeys, RequestKeys, SerializerKeys
from project.serializers import CreateProjectRequestSerializer, SetProjectResponseSerializer, \
    ProjectCreationDropdownsResponseSerializer, ListProjectsRequestSerializer, ListProjectsResponseSerializer, \
    PatchProjectRequestSerializer, ProjectPositionDropdownsResponseSerializer, \
    ProjectPositionDropdownsRequestSerializer, CreateProjectPositionRequestSerializer, \
    RetrieveProjectResponseSerializer, EditProjectPositionSerializer, CreateProjectAllocationRequestSerializer, \
    RetrieveProjectTimelineResponseSerializer, RetrieveProjectTimelineRequestSerializer, EditProjectRequestSerializer, \
    CreateAllocationRequestSerializer, EditProjectAllocationSerializer, EditProjectAllocationRequestSerializer, \
    PatchProjectAllocationRequestSerializer, NotificationRequestSerializer, \
    CreateProjectPositionRequestSerializerResponse
from project.services import ProjectService, ProjectAllocationService, ProjectTimelineService, NotificationService


class ProjectAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.PROJECT_PERMISSIONS

    @swagger_auto_schema(request_body=CreateProjectRequestSerializer(),
                         responses={status.HTTP_201_CREATED: SetProjectResponseSerializer()})
    def post(self, request):
        """
        API to create a project.
        """
        service = ProjectService()
        request_serializer = CreateProjectRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        project = service.create_project(
            request_serializer.validated_data, request.user)
        response_serializer = SetProjectResponseSerializer(project)
        response = {ResponseKeys.PROJECT: response_serializer.data}
        return Response(response, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(query_serializer=ListProjectsRequestSerializer(),
                         responses={status.HTTP_200_OK: ListProjectsResponseSerializer(many=True)})
    def get(self, request):
        """
        API to list projects.
        """
        service = ProjectService()
        request_serializer = ListProjectsRequestSerializer(data=request.GET)
        request_serializer.is_valid(raise_exception=True)

        page = request_serializer.validated_data.pop(RequestKeys.PAGE)
        size = request_serializer.validated_data.pop(RequestKeys.SIZE)

        projects = service.list_projects(request_serializer.validated_data)
        paginated_projects = paginate(projects, page, size)

        response_serializer = ListProjectsResponseSerializer(
            paginated_projects, many=True)
        response = {ResponseKeys.PROJECTS: response_serializer.data,
                    ResponseKeys.COUNT: projects.count()}
        return Response(response, status=status.HTTP_200_OK)


class ProjectDetailAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.PROJECT_PERMISSIONS

    @swagger_auto_schema(request_body=PatchProjectRequestSerializer(),
                         responses={status.HTTP_200_OK: SetProjectResponseSerializer()})
    def patch(self, request, project_id):
        """
        API to update specific fields of a project.
        """
        service = ProjectService()
        request_serializer = PatchProjectRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        project = service.patch_project(
            project_id, request_serializer.validated_data)
        response_serializer = SetProjectResponseSerializer(project)
        response = {ResponseKeys.PROJECT: response_serializer.data}
        return Response(response, status=status.HTTP_200_OK)

    @swagger_auto_schema(responses={status.HTTP_200_OK: RetrieveProjectResponseSerializer()})
    def get(self, request, project_id):
        """
        API to get project details.
        """
        service = ProjectService()
        project = service.retrieve_project(project_id)
        response_serializer = RetrieveProjectResponseSerializer(project)
        response = {ResponseKeys.PROJECT: response_serializer.data}
        return Response(response, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=EditProjectRequestSerializer(),
                         responses={status.HTTP_200_OK: SetProjectResponseSerializer()})
    def put(self, request, project_id):
        """
        API to edit a project details.
        """
        service = ProjectService()
        request_serializer = EditProjectRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        project = service.edit_project_details(
            project_id, request_serializer.validated_data, request.user)
        response_serializer = SetProjectResponseSerializer(project)
        response = {ResponseKeys.PROJECT: response_serializer.data}
        return Response(response, status=status.HTTP_200_OK)


class ProjectCreationDropdownsAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.PROJECT_CREATION_DROPDOWN_PERMISSIONS

    @swagger_auto_schema(responses={status.HTTP_200_OK: ProjectCreationDropdownsResponseSerializer()})
    def get(self, request):
        """
        API to get dropdowns required while adding/editing projects.
        """
        service = ProjectService()
        dropdowns = service.get_project_creation_dropdowns(request.user)
        response_serializer = ProjectCreationDropdownsResponseSerializer(
            dropdowns)
        response = {ResponseKeys.DROPDOWNS: response_serializer.data}
        return Response(response, status=status.HTTP_200_OK)


class ProjectPositionDropdownsAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.PROJECT_POSITION_DROPDOWN_PERMISSIONS

    @swagger_auto_schema(query_serializer=ProjectPositionDropdownsRequestSerializer(),
                         responses={status.HTTP_200_OK: ProjectPositionDropdownsResponseSerializer()})
    def get(self, request):
        """
        API to get dropdowns required while adding/editing project positions.
        """
        service = ProjectAllocationService()
        request_serializer = ProjectPositionDropdownsRequestSerializer(
            data=request.GET)
        request_serializer.is_valid(raise_exception=True)
        dropdowns = service.get_project_position_dropdowns(
            request_serializer.validated_data)
        response_serializer = ProjectPositionDropdownsResponseSerializer(
            dropdowns)
        response = {ResponseKeys.DROPDOWNS: response_serializer.data}
        return Response(response, status=status.HTTP_200_OK)


class ProjectPositionAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.PROJECT_POSITION_PERMISSIONS

    @swagger_auto_schema(request_body=CreateProjectPositionRequestSerializer())
    def post(self, request):
        """
        API to create project positions.
        """
        service = ProjectAllocationService()
        request_serializer = CreateProjectPositionRequestSerializer(
            data=request.data)
        request_serializer.is_valid(raise_exception=True)
        positions_response_data = service.create_project_position(
            request_serializer.validated_data, request.user)
        response_serializer = []
        for position_response_data in positions_response_data:
            response_serializer.append(
                CreateProjectPositionRequestSerializerResponse(position_response_data).data)
        response = {ResponseKeys.POSITIONS: response_serializer}
        return Response(status=status.HTTP_201_CREATED, data=response)


class ProjectPositionDetailAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.PROJECT_POSITION_PERMISSIONS

    @swagger_auto_schema(request_body=EditProjectPositionSerializer(),
                         responses={status.HTTP_200_OK: EditProjectPositionSerializer()})
    def patch(self, request, position_id):
        """
        API to edit a project position.
        """
        service = ProjectAllocationService()
        request_serializer = EditProjectPositionSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        position = service.edit_project_position(
            position_id, request_serializer.validated_data, request.user)
        response_serializer = EditProjectPositionSerializer(position)
        response = {ResponseKeys.POSITION: response_serializer.data}
        return Response(response, status=status.HTTP_200_OK)

    def delete(self, request, position_id):
        """
        API to delete a project position.
        """
        service = ProjectAllocationService()
        service.delete_project_position(position_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectRoleAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.PROJECT_POSITION_PERMISSIONS

    def delete(self, request, project_role_id):
        """
        API to delete a project role.
        """
        service = ProjectAllocationService()
        service.delete_project_role(project_role_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectAllocationAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.PROJECT_ALLOCATION_PERMISSIONS

    @swagger_auto_schema(request_body=CreateProjectAllocationRequestSerializer())
    def post(self, request):
        service = ProjectAllocationService()
        request_serializer = CreateProjectAllocationRequestSerializer(
            data=request.data)
        request_serializer.is_valid(raise_exception=True)
        service.create_project_allocation(
            request_serializer.validated_data, request.user)
        return Response(status=status.HTTP_201_CREATED)


class ProjectAllocationDetailAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.PROJECT_ALLOCATION_PERMISSIONS

    def delete(self, request, allocation_id):
        service = ProjectAllocationService()
        service.delete_project_allocation(allocation_id, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(request_body=EditProjectAllocationSerializer())
    def put(self, request, allocation_id):
        service = ProjectAllocationService()
        request_serializer = EditProjectAllocationSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        service.edit_project_allocation(
            allocation_id, request_serializer.validated_data, request.user)
        return Response(status=status.HTTP_200_OK)


class ProjectAllocationRequestAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.PROJECT_ALLOCATION_REQUEST_PERMISSIONS

    @swagger_auto_schema(request_body=CreateAllocationRequestSerializer())
    def post(self, request):
        service = ProjectAllocationService()
        request_serializer = CreateAllocationRequestSerializer(
            data=request.data)
        request_serializer.is_valid(raise_exception=True)
        service.create_project_allocation_request(
            request_serializer.validated_data, request.user)
        return Response(status=status.HTTP_201_CREATED)


class ProjectAllocationRequestDetailAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.PROJECT_ALLOCATION_REQUEST_PERMISSIONS

    def delete(self, request, allocation_request_id):
        service = ProjectAllocationService()
        service.delete_project_allocation_request(allocation_request_id)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(request_body=EditProjectAllocationRequestSerializer())
    def put(self, request, allocation_request_id):
        service = ProjectAllocationService()
        request_serializer = EditProjectAllocationRequestSerializer(
            data=request.data)
        request_serializer.is_valid(raise_exception=True)
        service.edit_project_allocation_request(
            allocation_request_id, request_serializer.validated_data, request.user)
        return Response(status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=PatchProjectAllocationRequestSerializer())
    def patch(self, request, allocation_request_id):
        service = ProjectAllocationService()
        request_serializer = PatchProjectAllocationRequestSerializer(
            data=request.data)
        request_serializer.is_valid(raise_exception=True)
        service.patch_project_allocation_request(
            allocation_request_id, request_serializer.validated_data, request.user)
        return Response(status=status.HTTP_200_OK)


class RetrieveProjectTimelineAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.PROJECT_PERMISSIONS

    @swagger_auto_schema(query_serializer=RetrieveProjectTimelineRequestSerializer(),
                         responses={status.HTTP_200_OK: RetrieveProjectTimelineResponseSerializer()})
    def get(self, request, project_id):
        """
        API to get project details.
        """
        service = ProjectTimelineService()
        request_serializer = RetrieveProjectTimelineRequestSerializer(
            data=request.GET)
        request_serializer.is_valid(raise_exception=True)
        search = request_serializer.validated_data.pop(
            RequestKeys.SEARCH, None)
        project = service.retrieve_project_timeline(project_id)
        response_date_start = request_serializer.validated_data.get(
            RequestKeys.RESPONSE_DATE_START)
        response_date_end = request_serializer.validated_data.get(
            RequestKeys.RESPONSE_DATE_END)
        response_serializer = RetrieveProjectTimelineResponseSerializer(project, context={
            SerializerKeys.SEARCH: search,
            SerializerKeys.PROJECT_ID: project_id,
            SerializerKeys.RESPONSE_DATE_START: response_date_start,
            SerializerKeys.RESPONSE_DATE_END: response_date_end})
        response = {ResponseKeys.PROJECT: response_serializer.data}
        return Response(response, status=status.HTTP_200_OK)


class NotificationAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.NOTIFICATION_PERMISSIONS

    @swagger_auto_schema(responses={status.HTTP_200_OK: NotificationRequestSerializer()})
    def get(self, request):
        service = NotificationService()
        notification = service.get_notification(request.user)
        response_serializer = NotificationRequestSerializer(
            notification, many=True)
        response = {ResponseKeys.NOTIFICATIONS: response_serializer.data}
        return Response(response, status=status.HTTP_200_OK)


class NotificationDetailAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.NOTIFICATION_PERMISSIONS

    def patch(self, request, notification_id):
        service = NotificationService()
        service.read_notification(notification_id)
        return Response(status=status.HTTP_200_OK)


class NotificationMarkReadAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.NOTIFICATION_PERMISSIONS

    def patch(self, request):
        service = NotificationService()
        service.read_all_notifications(request.user)
        return Response(status=status.HTTP_200_OK)
