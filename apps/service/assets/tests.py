import logging

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from assets.models import InUseAsset, Inventory, AssetBrand, AssetModels, AssetTypes
from assets.constants import (
    ResponseKeys,
    ErrorMessages,
    PermissionKeys,
)
from utils.permissions import get_permission_object

from user.models import User


class BaseTestCase(APITestCase):
    user = None

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        logging.disable(logging.CRITICAL)

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            employee_id=1, email="user@company.io", first_name="Foo", last_name="Bar"
        )


class AssetTests(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        permission = get_permission_object(
            PermissionKeys.ASSET_PERMISSIONS[PermissionKeys.POST][0]
        )
        cls.user.user_permissions.add(permission)
        permission = get_permission_object(
            PermissionKeys.ASSET_PERMISSIONS[PermissionKeys.GET][0]
        )
        cls.user.user_permissions.add(permission)
        permission = get_permission_object(
            PermissionKeys.ASSET_PERMISSIONS[PermissionKeys.PUT][0]
        )
        cls.user.user_permissions.add(permission)
        permission = get_permission_object(
            PermissionKeys.ASSET_PERMISSIONS[PermissionKeys.DELETE][0]
        )
        cls.user.user_permissions.add(permission)

        cls.inventory1 = Inventory.objects.create(
            serial_num="TEST_SNO1",
            brand="TestBrand1",
            ownership="TestOwner1",
            screensize="16 inch",
        )
        cls.in_use_asset1 = InUseAsset.objects.create(
            inventory=cls.inventory1,
            location="Bangalore",
            active="INV",
            date_of_change="2024-05-30T04:34:36.512Z",
            change_id="TEST_SNO1*1",
        )

        cls.inventory2 = Inventory.objects.create(
            serial_num="TEST_SNO2",
            brand="TestBrand2",
            ownership="TestOwner2",
            screensize="16 inch",
        )
        cls.in_use_asset2 = InUseAsset.objects.create(
            inventory=cls.inventory2,
            active="ASSI",
            date_of_change="2024-05-30T04:35:36.512Z",
            change_id="TEST_SNO2*1",
        )

        cls.inventory3 = Inventory.objects.create(
            serial_num="TEST_SNO3",
            brand="TestBrand3",
            ownership="TestOwner3",
            screensize="16 inch",
        )
        cls.in_use_asset3 = InUseAsset.objects.create(
            inventory=cls.inventory3,
            closed="WR",
            user=cls.user,
            date_of_change="2024-05-30T04:35:36.512Z",
            change_id="TEST_SNO3*1",
        )

    def test_add_assets(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("v1:assets:assets")
        data = {
            "inventory": {
                "serialNum": "SNO",
                "model": "string",
                "type": "Laptop",
                "brand": "Apple",
                "cbAssetId": "ASS_ET_ID",
                "ownership": "CB",
                "screensize": "6 inches",
                "colour": "red",
                "year": "2014",
                "ram": 8,
                "dateOfPurchase": "2024-05-22T09:56:16.614Z",
                "invoiceNum": "INVC123",
                "linkToInvoice": "link",
                "amount": 100,
                "gst": 18,
                "totalAmtPaid": 118,
                "vendor": "string",
                "isJumpCloudIntegration": True,
                "warranty": 5,
                "leaseStartDate": "2024-05-22T09:56:16.614Z",
                "leasingCompany": "string",
                "clientAssetAllocationDate": "2024-05-22T09:56:16.614Z",
                "comments": "string",
                "archived": True,
            },
            "inUseAsset": {
                "serialNum": "SNO",
                "userId": self.user.id,
                "dateOfChange": "2024-05-22T09:56:16.614Z",
                "location": "Bangalore",
                "otherAssets": "no other assets",
                "comments": "comment",
                "client": "ThoughtWorks",
                "project": "ThoughtWorks",
                "active": "INV",
                "closed": None,
            },
        }

        response = self.client.post(url, data, format="json")

        asset = Inventory.objects.filter(serial_num="SNO").first()
        in_use_asset = InUseAsset.objects.filter(inventory_id=asset.serial_num).first()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data[ResponseKeys.ASSET][ResponseKeys.INVENTORY]["serial_num"],
            asset.serial_num,
        )
        self.assertEqual(
            response.data[ResponseKeys.ASSET][ResponseKeys.IN_USE_ASSET]["change_id"],
            in_use_asset.change_id,
        )

    def test_list_assets(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("v1:assets:assets")

        response = self.client.get(url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["assets"][0]["serial_num"], "TEST_SNO1")
        self.assertEqual(response.data["assets"][1]["serial_num"], "TEST_SNO2")

    def test_list_asset_with_active_filter(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("v1:assets:assets")
        data = {"active_filter": ["INV", "ASSI"]}

        response = self.client.get(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_list_asset_with_close_filter(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("v1:assets:assets")
        data = {"close_filter": ["WR"]}

        response = self.client.get(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_list_asset_with_search_filter(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("v1:assets:assets")
        data = {"search": "Foo"}

        response = self.client.get(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data[ResponseKeys.ASSETS][0]["tagged_to"], "Foo Bar")

    def test_get_asset_detail(self):
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "v1:assets:detail_asset", kwargs={"asset_serial_num": "TEST_SNO1"}
        )
        response = self.client.get(url, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[ResponseKeys.ASSET]["serial_num"], "TEST_SNO1")
        self.assertEqual(response.data[ResponseKeys.ASSET]["ownership"], "TestOwner1")

    def test_add_same_asset(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("v1:assets:assets")
        self.user2 = User.objects.create_user(
            employee_id=2, email="user2@company.io", first_name="Foo2", last_name="Bar2"
        )

        data = {
            "inventory": {
                "serialNum": "TEST_SNO1",
                "model": "string",
                "type": "Laptop",
                "brand": "Apple",
                "cbAssetId": "ASS_ET_ID",
                "ownership": "CB",
                "screensize": "6 inches",
            },
            "inUseAsset": {
                "serialNum": "TEST_SNO1",
                "userId": self.user2.id,
                "dateOfChange": "2024-05-22T09:56:16.614Z",
                "location": "Bangalore",
            },
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.data["detail"], ErrorMessages.ASSET_EXISTS)

    def test_update_asset_assignee(self):
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "v1:assets:detail_asset", kwargs={"asset_serial_num": "TEST_SNO1"}
        )
        self.user2 = User.objects.create_user(
            employee_id=2, email="user2@company.io", first_name="Foo2", last_name="Bar2"
        )

        data = {
            "inventory": {
                "serialNum": "TEST_SNO1",
                "model": "string",
                "type": "Laptop",
                "brand": "Apple",
                "cbAssetId": "ASS_ET_ID",
                "ownership": "CB",
                "screensize": "6 inches",
            },
            "inUseAsset": {
                "serialNum": "TEST_SNO1",
                "userId": self.user2.id,
                "dateOfChange": "2024-05-22T09:56:16.614Z",
                "location": "Bangalore",
            },
        }

        response = self.client.put(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data[ResponseKeys.ASSET][ResponseKeys.IN_USE_ASSET]["change_id"],
            "TEST_SNO1*2",
        )
        in_use_asset = InUseAsset.objects.filter(change_id="TEST_SNO1*2").first()
        self.assertEqual(in_use_asset.user, self.user2)

    def test_update_asset_details(self):
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "v1:assets:detail_asset", kwargs={"asset_serial_num": "TEST_SNO1"}
        )

        data = {
            "inventory": {
                "serialNum": "TEST_SNO1",
                "model": "string",
                "type": "Laptop",
                "brand": "Apple",
                "cbAssetId": "ASS_ET_ID",
                "ownership": "CB",
                "screensize": "6 inches",
            },
            "inUseAsset": {
                "serialNum": "TEST_SNO1",
                "userId": None,
                "dateOfChange": "2024-05-22T09:56:16.614Z",
                "location": "Hyderabad",
                "active": "INV",
                "closed": None,
            },
        }

        response = self.client.put(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data[ResponseKeys.ASSET][ResponseKeys.IN_USE_ASSET]["change_id"],
            "TEST_SNO1*1",
        )
        in_use_asset = InUseAsset.objects.filter(change_id="TEST_SNO1*1").first()
        self.assertEqual(in_use_asset.location, "Hyderabad")

    def test_delete_asset(self):
        self.client.force_authenticate(user=self.user)
        url = reverse(
            "v1:assets:detail_asset", kwargs={"asset_serial_num": "TEST_SNO1"}
        )
        response = self.client.delete(url, format="json")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        asset = Inventory.objects.filter(serial_num="TEST_SNO1").first()
        in_use_asset = InUseAsset.objects.filter(inventory_id="TEST_SNO1").first()
        self.assertEqual(asset, None)
        self.assertEqual(in_use_asset, None)


class AssetTypesTests(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        cls.type1 = AssetTypes.objects.create(name="Type1")
        cls.type2 = AssetTypes.objects.create(name="Type2")
        super().setUpTestData()

    def test_add_type(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("v1:assets:asset_types")
        data = {"name": "test_type"}
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        type = AssetTypes.objects.filter(name="test_type").first()
        self.assertEqual(data["name"], type.name)

    def test_get_types(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("v1:assets:asset_types")
        response = self.client.get(url, format="json")
        self.assertEqual(response.data[0]["name"], "Type1")
        self.assertEqual(response.data[1]["name"], "Type2")

    def test_delete_type(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("v1:assets:asset_types")
        data = {"id": self.type2.id}
        response = self.client.delete(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        type = AssetTypes.objects.filter(id=self.type2.id).first()
        self.assertEqual(type, None)


class AssetBrandTests(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        cls.brand1 = AssetBrand.objects.create(name="Brand1")
        cls.brand2 = AssetBrand.objects.create(name="Brand2")
        super().setUpTestData()

    def test_add_brand(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("v1:assets:asset_brands")
        data = {"name": "test_brand"}
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        brand = AssetBrand.objects.filter(name="test_brand").first()
        self.assertEqual(data["name"], brand.name)

    def test_get_brands(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("v1:assets:asset_brands")
        response = self.client.get(url, format="json")
        self.assertEqual(response.data[0]["name"], "Brand1")
        self.assertEqual(response.data[1]["name"], "Brand2")

    def test_delete_brand(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("v1:assets:asset_brands")
        data = {"id": self.brand2.id}
        response = self.client.delete(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        brand = AssetBrand.objects.filter(id=self.brand2.id).first()
        self.assertEqual(brand, None)


class AssetModelsTests(BaseTestCase):

    @classmethod
    def setUpTestData(cls):
        cls.model1 = AssetModels.objects.create(name="Model1")
        cls.model2 = AssetModels.objects.create(name="Model2")
        super().setUpTestData()

    def test_add_model(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("v1:assets:asset_models")
        data = {"name": "test_model"}
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        model = AssetModels.objects.filter(name="test_model").first()
        self.assertEqual(data["name"], model.name)

    def test_get_models(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("v1:assets:asset_models")
        response = self.client.get(url, format="json")
        self.assertEqual(response.data[0]["name"], "Model1")
        self.assertEqual(response.data[1]["name"], "Model2")

    def test_delete_model(self):
        self.client.force_authenticate(user=self.user)
        url = reverse("v1:assets:asset_models")
        data = {"id": self.model2.id}
        response = self.client.delete(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        model = AssetModels.objects.filter(id=self.model2.id).first()
        self.assertEqual(model, None)
