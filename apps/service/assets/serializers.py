from rest_framework import serializers


from assets.models import Inventory, InUseAsset, AssetBrand, AssetModels, AssetTypes
from utils.utils import camel_to_snake
from assets.constants import DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE


class ListAssetRequestSerializer(serializers.Serializer):
    search = serializers.CharField(required=False)
    archived = serializers.BooleanField(required=False)
    active_filter = serializers.ListField(child=serializers.CharField(), required=False)
    close_filter = serializers.ListField(child=serializers.CharField(), required=False)
    page = serializers.IntegerField(default=DEFAULT_PAGE_NUMBER)
    size = serializers.IntegerField(default=DEFAULT_PAGE_SIZE)

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class ListAssetResponseSerializer(serializers.ModelSerializer):

    tagged_to = serializers.SerializerMethodField()
    active = serializers.SerializerMethodField()
    closed = serializers.SerializerMethodField()

    def get_active(self, instance):
        in_use_asset = instance.latest_in_use_asset
        if in_use_asset and in_use_asset.active:
            return in_use_asset.active
        return None

    def get_closed(self, instance):
        in_use_asset = instance.latest_in_use_asset
        if in_use_asset and in_use_asset.closed:
            return in_use_asset.closed
        return None

    def get_tagged_to(self, instance):
        in_use_asset = instance.latest_in_use_asset
        if in_use_asset and in_use_asset.user:
            return in_use_asset.user.full_name
        return None

    class Meta:
        model = Inventory
        fields = (
            "serial_num",
            "model",
            "type",
            "year",
            "cb_asset_id",
            "comments",
            "screensize",
            "archived",
            "tagged_to",
            "active",
            "closed",
        )


class ListDetailedAssetResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = (
            "serial_num",
            "model",
            "type",
            "brand",
            "cb_asset_id",
            "ownership",
            "screensize",
            "colour",
            "screenshot",
            "year",
            "ram",
            "date_of_purchase",
            "invoice_num",
            "link_to_invoice",
            "amount",
            "gst",
            "total_amt_paid",
            "vendor",
            "is_jump_cloud_integration",
            "warranty",
            "lease_start_date",
            "leasing_company",
            "client_asset_allocation_date",
            "comments",
            "archived",
        )


class ListDetailedInUseAssetResponseSerializer(serializers.ModelSerializer):
    employee_id = serializers.SerializerMethodField()
    tagged_to = serializers.SerializerMethodField()
    user_id = serializers.SerializerMethodField()

    def get_employee_id(self, instance):
        if instance.user:
            return instance.user.employee_id
        return None

    def get_tagged_to(self, instance):
        if instance.user:
            return instance.user.full_name
        return None

    def get_user_id(self, instance):
        if instance.user:
            return instance.user.id
        return None

    class Meta:
        model = InUseAsset
        fields = (
            "change_id",
            "user_id",
            "employee_id",
            "tagged_to",
            "date_of_change",
            "location",
            "other_assets",
            "comments",
            "client",
            "project",
            "active",
            "closed",
        )


class CreateAssetRequestSerializer(serializers.ModelSerializer):
    serial_num = serializers.CharField(required=True)

    class Meta:
        model = Inventory
        fields = (
            "serial_num",
            "model",
            "type",
            "brand",
            "cb_asset_id",
            "ownership",
            "screensize",
            "colour",
            "screenshot",
            "year",
            "ram",
            "date_of_purchase",
            "invoice_num",
            "link_to_invoice",
            "amount",
            "gst",
            "total_amt_paid",
            "vendor",
            "is_jump_cloud_integration",
            "warranty",
            "lease_start_date",
            "leasing_company",
            "client_asset_allocation_date",
            "comments",
            "archived",
        )


class SetAssetResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = (
            "serial_num",
            "model",
            "type",
            "brand",
            "cb_asset_id",
            "ownership",
            "screensize",
            "colour",
            "year",
            "screenshot",
            "ram",
            "date_of_purchase",
            "invoice_num",
            "link_to_invoice",
            "amount",
            "gst",
            "total_amt_paid",
            "vendor",
            "is_jump_cloud_integration",
            "warranty",
            "lease_start_date",
            "leasing_company",
            "client_asset_allocation_date",
            "comments",
            "archived",
        )


class EditAssetRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = (
            "model",
            "type",
            "brand",
            "cb_asset_id",
            "ownership",
            "screensize",
            "colour",
            "year",
            "screenshot",
            "ram",
            "date_of_purchase",
            "invoice_num",
            "link_to_invoice",
            "amount",
            "gst",
            "total_amt_paid",
            "vendor",
            "is_jump_cloud_integration",
            "warranty",
            "lease_start_date",
            "leasing_company",
            "client_asset_allocation_date",
            "comments",
            "archived",
        )


class CreateInUseAssetRequestSerializer(serializers.ModelSerializer):
    serial_num = serializers.CharField(required=True)
    user_id = serializers.IntegerField(default=None, required=False, allow_null=True)

    class Meta:
        model = InUseAsset
        fields = (
            "serial_num",
            "user_id",
            "date_of_change",
            "location",
            "other_assets",
            "comments",
            "client",
            "project",
            "active",
            "closed",
        )


class EditInUseAssetRequestSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = InUseAsset
        fields = (
            "user_id",
            "date_of_change",
            "location",
            "other_assets",
            "comments",
            "client",
            "project",
            "active",
            "closed",
        )


class SetInUseAssetResponseSerializer(serializers.ModelSerializer):
    change_id = serializers.CharField(required=True, allow_null=False)

    class Meta:
        model = InUseAsset
        fields = (
            "change_id",
            "date_of_change",
            "location",
            "other_assets",
            "comments",
            "client",
            "project",
            "active",
            "closed",
        )


class EditInUseAssetResponseSerializer(serializers.ModelSerializer):
    change_id = serializers.CharField(required=True, allow_null=False)

    class Meta:
        model = InUseAsset
        fields = (
            "change_id",
            "date_of_change",
            "location",
            "other_assets",
            "comments",
            "client",
            "project",
            "active",
            "closed",
        )


class ListAssetTimeLineResponseSerializer(serializers.ModelSerializer):

    tagged_to = serializers.SerializerMethodField()
    date_of_change = serializers.SerializerMethodField()
    archived = serializers.SerializerMethodField()

    def get_archived(self, instance):
        return instance.inventory.archived

    def get_date_of_change(self, instance):
        date_of_change = instance.date_of_change
        return date_of_change.date() or None

    def get_tagged_to(self, instance):
        if instance.user:
            return instance.user.full_name
        return None

    class Meta:
        model = InUseAsset
        fields = (
            "change_id",
            "inventory_id",
            "active",
            "date_of_change",
            "closed",
            "tagged_to",
            "archived",
        )


class EditAssetParentSerializer(serializers.Serializer):
    inventory = EditAssetRequestSerializer()
    in_use_asset = EditInUseAssetRequestSerializer()


class CreateAssetParentRequestSerializer(serializers.Serializer):
    inventory = CreateAssetRequestSerializer()
    in_use_asset = CreateInUseAssetRequestSerializer()


class SetAssetParentResponseSerializer(serializers.Serializer):
    inventory = SetAssetResponseSerializer()
    in_use_asset = SetInUseAssetResponseSerializer()


class AssetBrandSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=True)

    class Meta:
        model = AssetBrand
        fields = ("id", "name")


class CreateAssetBrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetBrand
        fields = ("name",)


class DeleteAssetBrandSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=True)

    class Meta:
        model = AssetBrand
        fields = ("id",)


class AssetModelsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=True)

    class Meta:
        model = AssetModels
        fields = ("id", "name")


class CreateAssetModelsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetModels
        fields = ("name",)


class DeleteAssetModelsSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=True)

    class Meta:
        model = AssetModels
        fields = ("id",)


class AssetTypesSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=True)

    class Meta:
        model = AssetTypes
        fields = ("id", "name")


class CreateAssetTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssetTypes
        fields = ("name",)


class DeleteAssetTypesSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=True)

    class Meta:
        model = AssetTypes
        fields = ("id",)
