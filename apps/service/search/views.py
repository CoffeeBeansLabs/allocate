from datetime import timedelta

from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from authapp.permissions import APIPermission
from helpers.pagination import paginate
from search.constants import ResponseKeys, PermissionKeys, RequestKeys, SerializerKeys
from search.serializers import SearchTalentRequestSerializer, SearchTalentResponseSerializer, \
    SearchTalentCriteriaSerializer, QuickSearchTalentCriteriaSerializer, UniversalSearchUserResponseSerializer, \
    UniversalSearchClientResponseSerializer, UniversalSearchProjectResponseSerializer, QuickSearchRequestSerializer
from search.services import SearchTalentService


class SearchTalentAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.SEARCH_TALENT_PERMISSIONS

    @swagger_auto_schema(query_serializer=SearchTalentRequestSerializer(),
                         responses={status.HTTP_200_OK: SearchTalentResponseSerializer()})
    def get(self, request):
        """
        API to provide talent recommendation based on search criteria.
        """
        service = SearchTalentService()
        request_serializer = SearchTalentRequestSerializer(data=request.GET)
        request_serializer.is_valid(raise_exception=True)

        position = request_serializer.validated_data.get(RequestKeys.POSITION)
        search = request_serializer.validated_data.get(RequestKeys.SEARCH)
        related_suggestions = request_serializer.validated_data.get(RequestKeys.RELATED_SUGGESTIONS)
        page = request_serializer.validated_data.get(RequestKeys.PAGE)
        size = request_serializer.validated_data.get(RequestKeys.SIZE)
        response_date_start = request_serializer.validated_data.get(RequestKeys.RESPONSE_DATE_START)
        response_date_end = request_serializer.validated_data.get(RequestKeys.RESPONSE_DATE_END)
        locations = request_serializer.validated_data.get(RequestKeys.LOCATIONS)

        start_date = position.start_date
        end_date = position.end_date or start_date + timedelta(days=89)
        skills = position.skills.all()
        skill_ids = list(skills.values_list('id', flat=True))

        talents = service.query_talents(position.project_role.role, skill_ids, search, locations, related_suggestions)
        talents = service.score_talents(
            talents,
            start_date=start_date, end_date=end_date, utilization=position.utilization, skill_ids=skill_ids,
            experience_start=position.experience_range_start, experience_end=position.experience_range_end
        )
        paginated_talents = paginate(talents, page, size)

        criteria_response_serializer = SearchTalentCriteriaSerializer(position)
        talent_response_serializer = SearchTalentResponseSerializer(
            paginated_talents, many=True, context={SerializerKeys.SKILLS: skills,
                                                   SerializerKeys.RESPONSE_DATE_START: response_date_start,
                                                   SerializerKeys.RESPONSE_DATE_END: response_date_end}
        )
        response = {ResponseKeys.CRITERIA: criteria_response_serializer.data,
                    ResponseKeys.TALENTS: talent_response_serializer.data, ResponseKeys.COUNT: len(talents)}

        return Response(response, status=status.HTTP_200_OK)


class QuickSearchTalentAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.SEARCH_TALENT_PERMISSIONS

    @swagger_auto_schema(request_body=QuickSearchTalentCriteriaSerializer(),
                         responses={status.HTTP_200_OK: SearchTalentResponseSerializer()})
    def post(self, request):
        """
        API to provide talent recommendation based on search criteria.
        """
        service = SearchTalentService()
        request_serializer = QuickSearchTalentCriteriaSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        search = request_serializer.validated_data.get(RequestKeys.SEARCH)
        locations = request_serializer.validated_data.get(RequestKeys.LOCATIONS)
        related_suggestions = request_serializer.validated_data.get(RequestKeys.RELATED_SUGGESTIONS)
        response_date_start = request_serializer.validated_data.get(RequestKeys.RESPONSE_DATE_START)
        response_date_end = request_serializer.validated_data.get(RequestKeys.RESPONSE_DATE_END)
        projects = request_serializer.validated_data.get(RequestKeys.PROJECTS)
        page = request_serializer.validated_data.get(RequestKeys.PAGE)
        size = request_serializer.validated_data.get(RequestKeys.SIZE)
        start_date = request_serializer.validated_data.get(RequestKeys.START_DATE)
        end_date = request_serializer.validated_data.get(RequestKeys.END_DATE)
        skills = request_serializer.validated_data.get(RequestKeys.SKILLS)
        skill_ids = [skill.id for skill in skills]
        role = request_serializer.validated_data.get(RequestKeys.ROLE)
        role_id = role.id if role else None
        talents = service.query_talents(role_id, skill_ids, search, locations, related_suggestions, projects)
        talents = service.score_talents(
            talents,
            start_date=start_date, end_date=end_date,
            utilization=request_serializer.validated_data.get(RequestKeys.UTILIZATION),
            skill_ids=skill_ids,
            experience_start=request_serializer.validated_data.get(RequestKeys.EXPERIENCE_RANGE_START),
            experience_end=request_serializer.validated_data.get(RequestKeys.EXPERIENCE_RANGE_END)
        )

        paginated_talents = paginate(talents, page, size)

        criteria_response_serializer = QuickSearchTalentCriteriaSerializer(request_serializer.validated_data)
        talent_response_serializer = SearchTalentResponseSerializer(
            paginated_talents,
            many=True,
            context={SerializerKeys.SKILLS: skills,
                     SerializerKeys.RESPONSE_DATE_START: response_date_start,
                     SerializerKeys.RESPONSE_DATE_END: response_date_end,
                     SerializerKeys.PROJECTS: projects}
        )
        response = {ResponseKeys.CRITERIA: criteria_response_serializer.data,
                    ResponseKeys.TALENTS: talent_response_serializer.data, ResponseKeys.COUNT: len(talents)}
        return Response(response, status=status.HTTP_200_OK)


class UniversalSearchAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.SEARCH_TALENT_PERMISSIONS

    @swagger_auto_schema(query_serializer=QuickSearchRequestSerializer(),
                         responses={status.HTTP_200_OK: SearchTalentResponseSerializer()})
    def get(self, request):
        """
        API to provide Universal recommendation based on search criteria.
        """
        service = SearchTalentService()
        request_serializer = QuickSearchRequestSerializer(data=request.GET)
        request_serializer.is_valid(raise_exception=True)

        search = request_serializer.validated_data.get(RequestKeys.SEARCH)
        user_date = service.query_users(search)
        client_date = service.query_client(search)
        project_date = service.query_project(search)

        user_response = UniversalSearchUserResponseSerializer(user_date, many=True)
        client_response = UniversalSearchClientResponseSerializer(client_date, many=True)
        project_response = UniversalSearchProjectResponseSerializer(project_date, many=True)
        response = {ResponseKeys.USERS: user_response.data,
                    ResponseKeys.CLIENTS: client_response.data,
                    ResponseKeys.PROJECTS: project_response.data}

        return Response(response, status=status.HTTP_200_OK)
