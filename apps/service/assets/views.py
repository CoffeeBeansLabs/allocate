from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from assets.constants import (
    ResponseKeys,
    RequestKeys,
    CLOSE_LIST,
    ACTIVE_LIST,
    PermissionKeys,
)
from assets.serializers import (
    ListAssetRequestSerializer,
    ListAssetResponseSerializer,
    ListDetailedAssetResponseSerializer,
    ListDetailedInUseAssetResponseSerializer,
    ListAssetTimeLineResponseSerializer,
    EditAssetParentSerializer,
    SetAssetParentResponseSerializer,
    CreateAssetParentRequestSerializer,
    AssetBrandSerializer,
    CreateAssetBrandSerializer,
    AssetModelsSerializer,
    CreateAssetModelsSerializer,
    AssetTypesSerializer,
    CreateAssetTypesSerializer,
    DeleteAssetTypesSerializer,
    DeleteAssetBrandSerializer,
    DeleteAssetModelsSerializer,
)
from assets.services import (
    InventoryService,
    InUseAssetService,
    AssetService,
    AssetBrandService,
    AssetTypesService,
    AssetModelsService,
)
from authapp.permissions import APIPermission
from helpers.pagination import paginate


class AssetAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.ASSET_PERMISSIONS

    @swagger_auto_schema(
        query_serializer=ListAssetRequestSerializer(),
        responses={status.HTTP_200_OK: ListAssetResponseSerializer(many=True)},
    )
    def get(self, request):
        service = InventoryService()
        request_serializer = ListAssetRequestSerializer(data=request.GET)
        request_serializer.is_valid(raise_exception=True)

        page = request_serializer.validated_data.pop(RequestKeys.PAGE)
        size = request_serializer.validated_data.pop(RequestKeys.SIZE)

        assets = service.list_assets(request_serializer.validated_data)
        paginated_assets = paginate(assets, page, size)

        response_serializer = ListAssetResponseSerializer(paginated_assets, many=True)
        response = {
            ResponseKeys.ASSETS: response_serializer.data,
            ResponseKeys.COUNT: assets.count(),
        }
        return Response(response, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        request_body=CreateAssetParentRequestSerializer(),
        responses={status.HTTP_201_CREATED: SetAssetParentResponseSerializer()},
    )
    def post(self, request):
        request_serializer = CreateAssetParentRequestSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        service = AssetService()
        asset, in_use_asset = service.create(request_serializer.validated_data)

        asset_serializer = SetAssetParentResponseSerializer(
            {"inventory": asset, "in_use_asset": in_use_asset}
        )

        response = {ResponseKeys.ASSET: asset_serializer.data}
        return Response(response, status=status.HTTP_201_CREATED)


class AssetDetailAPIView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.ASSET_PERMISSIONS

    @swagger_auto_schema(
        responses={
            status.HTTP_200_OK: ListDetailedAssetResponseSerializer(),
            status.HTTP_201_CREATED: ListDetailedInUseAssetResponseSerializer(),
            status.HTTP_202_ACCEPTED: ListAssetTimeLineResponseSerializer(),
        },
    )
    def get(self, request, asset_serial_num):
        service_asset = InventoryService()
        service_in_use_asset = InUseAssetService()

        asset = service_asset.get_asset(asset_serial_num)
        in_use_asset = service_in_use_asset.get_in_use_asset(asset_serial_num)
        in_use_assets_timeline = service_in_use_asset.get_all_in_use_assets(
            asset_serial_num
        )

        asset_response_serializer = ListDetailedAssetResponseSerializer(asset)
        in_use_asset_response_serializer = ListDetailedInUseAssetResponseSerializer(
            in_use_asset
        )
        asset_timeline_response_serializer = ListAssetTimeLineResponseSerializer(
            in_use_assets_timeline, many=True
        )

        response_data = {
            **in_use_asset_response_serializer.data,
            **asset_response_serializer.data,
            ResponseKeys.TIMELINE: asset_timeline_response_serializer.data,
        }
        response = {ResponseKeys.ASSET: response_data}
        return Response(response, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        request_body=EditAssetParentSerializer(),
        responses={status.HTTP_200_OK: SetAssetParentResponseSerializer()},
    )
    def put(self, request, asset_serial_num):
        asset_service = AssetService()

        request_serializer = EditAssetParentSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)

        asset, in_use_asset = asset_service.update(
            asset_serial_num, request_serializer.validated_data
        )

        asset_serializer = SetAssetParentResponseSerializer(
            {"inventory": asset, "in_use_asset": in_use_asset}
        )

        response = {ResponseKeys.ASSET: asset_serializer.data}
        return Response(response, status=status.HTTP_200_OK)

    def delete(self, request, asset_serial_num):
        service = InventoryService()
        service.delete_asset(asset_serial_num)
        return Response(status=status.HTTP_204_NO_CONTENT)


class StatusView(APIView):
    permission_classes = [APIPermission]
    permissions = PermissionKeys.ASSET_PERMISSIONS

    def get(self, request):
        close_list = [{"id": key, "name": value} for key, value in CLOSE_LIST.items()]
        active_list = [{"id": key, "name": value} for key, value in ACTIVE_LIST.items()]
        response = {ResponseKeys.ACTIVE: active_list, ResponseKeys.CLOSE: close_list}
        return Response(response, status=status.HTTP_200_OK)


class AssetModelsView(APIView):
    @swagger_auto_schema(
        responses={status.HTTP_200_OK: AssetModelsSerializer(many=True)},
    )
    def get(self, request):
        service = AssetModelsService()
        models = service.get_models()
        response_serializer = AssetModelsSerializer(models, many=True)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=CreateAssetModelsSerializer())
    def post(self, request):
        service = AssetModelsService()
        request_serializer = CreateAssetModelsSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        service.create_model(request_serializer.data)
        return Response(status=status.HTTP_201_CREATED)

    @swagger_auto_schema(request_body=DeleteAssetModelsSerializer())
    def delete(self, request):
        service = AssetModelsService()
        request_serializer = DeleteAssetModelsSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        service.delete_model(request_serializer.validated_data)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AssetTypeView(APIView):
    @swagger_auto_schema(
        responses={status.HTTP_200_OK: AssetTypesSerializer(many=True)},
    )
    def get(self, request):
        service = AssetTypesService()
        types = service.get_types()
        response_serializer = AssetTypesSerializer(types, many=True)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=CreateAssetTypesSerializer())
    def post(self, request):
        service = AssetTypesService()
        request_serializer = CreateAssetTypesSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        service.create_type(request_serializer.data)
        return Response(status=status.HTTP_201_CREATED)

    @swagger_auto_schema(request_body=DeleteAssetTypesSerializer())
    def delete(self, request):
        service = AssetTypesService()
        request_serializer = DeleteAssetTypesSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        service.delete_type(request_serializer.validated_data)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AssetBrandView(APIView):
    @swagger_auto_schema(
        responses={status.HTTP_200_OK: AssetBrandSerializer(many=True)},
    )
    def get(self, request):
        service = AssetBrandService()
        brands = service.get_brands()
        response_serializer = AssetBrandSerializer(brands, many=True)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(request_body=CreateAssetBrandSerializer())
    def post(self, request):
        service = AssetBrandService()
        request_serializer = CreateAssetBrandSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        service.create_brand(request_serializer.data)
        return Response(status=status.HTTP_201_CREATED)

    @swagger_auto_schema(request_body=DeleteAssetBrandSerializer())
    def delete(self, request):
        service = AssetBrandService()
        request_serializer = DeleteAssetBrandSerializer(data=request.data)
        request_serializer.is_valid(raise_exception=True)
        service.delete_brand(request_serializer.validated_data)
        return Response(status=status.HTTP_204_NO_CONTENT)
