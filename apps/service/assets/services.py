import base64
import re
from io import BytesIO

from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.utils import timezone

from assets.constants import ErrorMessages, FilePaths
from assets.filters import AssetFilter
from assets.models import Inventory, InUseAsset, AssetBrand, AssetModels, AssetTypes
from helpers.exceptions import InvalidRequest
from user.models import User
from utils.utils import upload_to_bucket, fetch_from_bucket


class AssetService:
    @transaction.atomic
    def create(self, data):
        asset_service = InventoryService()
        in_use_asset_service = InUseAssetService()

        asset = asset_service.create_asset(data["inventory"])
        in_use_asset = in_use_asset_service.create_in_use_asset(
            data["in_use_asset"])

        return asset, in_use_asset

    @transaction.atomic
    def update(self, serial_num, data):
        asset_service = InventoryService()
        in_use_asset_service = InUseAssetService()

        if data["inventory"]:
            asset = asset_service.update_asset(serial_num, data["inventory"])
        else:
            asset = None

        if data["in_use_asset"]:
            in_use_asset = in_use_asset_service.update_in_use_asset(
                serial_num, data["in_use_asset"]
            )
        else:
            in_use_asset = None

        return asset, in_use_asset


class InventoryService:
    def list_assets(self, filters):
        assets = Inventory.objects.all()
        assets = AssetFilter(filters, assets).qs
        assets = assets.order_by("serial_num")
        return assets

    def get_asset(self, asset_serial_num):
        asset = Inventory.objects.filter(serial_num=asset_serial_num).first()
        if not asset:
            raise InvalidRequest(ErrorMessages.INVALID_ASSET)
        if asset.screenshot:
            asset.screenshot = self.fetch_image(asset.screenshot)
        return asset

    def create_asset(self, data):
        img_string = data.pop("screenshot", None)
        if Inventory.objects.filter(serial_num=data["serial_num"]).exists():
            raise InvalidRequest(ErrorMessages.ASSET_EXISTS)

        asset = Inventory.objects.create(**data)

        if img_string:
            asset.screenshot = self.save_image(img_string)
            asset.save()
        return asset

    def update_asset(self, serial_num, data):
        img_string = data.pop("screenshot", None)

        Inventory.objects.filter(serial_num=serial_num).update(**data)
        asset = Inventory.objects.filter(serial_num=serial_num).first()

        if img_string:
            screenshot = self.save_image(img_string)
            asset.screenshot = screenshot
            asset.save()

        if not asset:
            raise InvalidRequest(ErrorMessages.INVALID_ASSET)
        return asset

    def delete_asset(self, serial_num):
        asset = Inventory.objects.filter(serial_num=serial_num)
        if not asset:
            raise InvalidRequest(ErrorMessages.INVALID_ASSET)
        asset.delete()

    def save_image(self, image_base64_string):
        image_data = base64.b64decode(image_base64_string)
        image_stream = BytesIO(image_data)

        timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
        filename = f"image_{timestamp}.jpg"
        upload_to_bucket(image_stream, FilePaths.SCREENSHOTS, filename)
        print(f"image with filename: {filename} has been saved in the bucket")
        return filename

    def fetch_image(self, filename):
        image_string = fetch_from_bucket(FilePaths.SCREENSHOTS, filename)
        image_string_b64 = base64.b64encode(image_string).decode("utf-8")
        return image_string_b64


class InUseAssetService:
    def get_in_use_asset(self, serial_num):
        in_use_asset = (
            InUseAsset.objects.filter(inventory_id=serial_num)
            .order_by("-date_of_change")
            .first()
        )
        if not in_use_asset:
            raise InvalidRequest(ErrorMessages.INVALID_ASSET)
        return in_use_asset

    def get_all_in_use_assets(self, serial_num):
        in_use_assets = InUseAsset.objects.filter(inventory_id=serial_num).order_by(
            "date_of_change"
        )
        if not in_use_assets:
            raise InvalidRequest(ErrorMessages.INVALID_ASSET)
        return in_use_assets

    def create_in_use_asset(self, data):
        change_id = data["serial_num"] + "*1"

        data["inventory_id"] = data.pop("serial_num")

        if data["user_id"]:
            User.objects.filter(id=data["user_id"]).first()

        data["change_id"] = change_id

        in_use_asset = InUseAsset.objects.create(**data)
        return in_use_asset

    @transaction.atomic
    def update_in_use_asset(self, serial_num, data):
        in_use_asset = (
            InUseAsset.objects.filter(inventory_id=serial_num)
            .order_by("-date_of_change")
            .first()
        )

        if not in_use_asset:
            return InvalidRequest(ErrorMessages.INVALID_IN_USE_ASSET)

        serial_num = in_use_asset.inventory_id
        change_id = in_use_asset.change_id

        count = re.findall(r"\*(\d+)", change_id)

        # If another user has been assigned to the asset or status of the asset has been changed
        if (
                data["user_id"] != in_use_asset.user_id
                or data["active"] != in_use_asset.active
                or data["closed"] != in_use_asset.closed
        ):
            change_id = serial_num + "*" + str(int(count[0]) + 1)
            data["change_id"] = change_id
            data["inventory_id"] = serial_num
            InUseAsset.objects.create(**data)

        # If any other information regarding the asset has been changed
        else:
            InUseAsset.objects.filter(change_id=change_id).update(**data)

        in_use_asset = InUseAsset.objects.filter(change_id=change_id).first()

        return in_use_asset


class AssetBrandService:

    def get_brands(self):
        brands = AssetBrand.objects.all().order_by("name")
        return brands

    def create_brand(self, data):
        brand = AssetBrand.objects.create(name=data["name"])
        return brand

    def delete_brand(self, data):
        try:
            brand = AssetBrand.objects.get(id=data["id"])
        except ObjectDoesNotExist:
            raise InvalidRequest(ErrorMessages.INVALID_BRAND)
        brand.delete()


class AssetTypesService:

    def get_types(self):
        types = AssetTypes.objects.all().order_by("name")
        return types

    def create_type(self, data):
        asset_type = AssetTypes.objects.create(name=data["name"])
        return asset_type

    def delete_type(self, data):
        try:
            asset_type = AssetTypes.objects.get(id=data["id"])
        except ObjectDoesNotExist:
            raise InvalidRequest(ErrorMessages.INVALID_TYPE)
        asset_type.delete()


class AssetModelsService:

    def get_models(self):
        models = AssetModels.objects.all().order_by("name")
        return models

    def create_model(self, data):
        model = AssetModels.objects.create(name=data["name"])
        return model

    def delete_model(self, data):
        try:
            model = AssetModels.objects.get(id=data["id"])
        except ObjectDoesNotExist:
            raise InvalidRequest(ErrorMessages.INVALID_MODEL)
        model.delete()
