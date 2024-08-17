from django.urls import path

from assets.views import (
    AssetAPIView,
    AssetDetailAPIView,
    StatusView,
    AssetTypeView,
    AssetModelsView,
    AssetBrandView,
)

urlpatterns = [
    path("", AssetAPIView.as_view(), name="assets"),
    path(
        "inventory-asset/<str:asset_serial_num>/",
        AssetDetailAPIView.as_view(),
        name="detail_asset",
    ),
    path("status/", StatusView.as_view(), name="status-keys"),
    path("brands/", AssetBrandView.as_view(), name="asset_brands"),
    path("types/", AssetTypeView.as_view(), name="asset_types"),
    path("models/", AssetModelsView.as_view(), name="asset_models"),
]
