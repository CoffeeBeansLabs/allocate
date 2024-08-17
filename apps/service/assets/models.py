from django.db import models

from user.models import User


class Inventory(models.Model):

    serial_num = models.TextField(primary_key=True, editable=False)
    model = models.CharField(max_length=100, null=True)
    type = models.CharField(max_length=100, null=True)
    brand = models.CharField(max_length=100, null=False, blank=False)
    cb_asset_id = models.CharField(max_length=100, null=True)
    ownership = models.CharField(max_length=100, null=False, blank=False)
    screensize = models.CharField(max_length=100, null=False, blank=False)
    colour = models.CharField(max_length=100, null=True)
    year = models.CharField(max_length=100, null=True)
    ram = models.IntegerField(null=True)
    date_of_purchase = models.DateTimeField(null=True)
    invoice_num = models.TextField(null=True)
    link_to_invoice = models.TextField(null=True)
    amount = models.IntegerField(null=True)
    gst = models.IntegerField(null=True)
    total_amt_paid = models.IntegerField(null=True)
    vendor = models.CharField(max_length=100, null=True)
    is_jump_cloud_integration = models.BooleanField(null=True)
    screenshot = models.TextField(null=True)
    warranty = models.IntegerField(null=True)
    lease_start_date = models.DateTimeField(null=True)
    leasing_company = models.CharField(max_length=100, null=True)
    client_asset_allocation_date = models.DateTimeField(null=True)
    comments = models.TextField(null=True)
    archived = models.BooleanField(default=False, null=True)

    @property
    def latest_in_use_asset(self):
        try:
            return InUseAsset.objects.filter(inventory=self).latest("date_of_change")
        except InUseAsset.DoesNotExist:
            return None


class InUseAsset(models.Model):
    class Close(models.TextChoices):
        WR = "WR", "Written Off"
        NW = "NW", "Not Working"
        SL = "SL", "Stolen/Lost"
        RC = "RC", "Returned to Client"
        LC = "LC", "Returned to Leasing Company"

    class Actives(models.TextChoices):
        INV = "INV", "Inventory"
        ASSI = "ASSI", "Assigned"
        TRAN = "TRAN", "In Transit"
        REP = "REP", "In Repair"

    change_id = models.CharField(primary_key=True, max_length=200)
    inventory = models.ForeignKey(
        Inventory, on_delete=models.CASCADE, null=False, related_name="related_asset"
    )
    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="assigned_assets"
    )
    date_of_change = models.DateTimeField(null=True)
    location = models.CharField(max_length=100, null=True)
    other_assets = models.TextField(null=True)
    comments = models.TextField(null=True)
    client = models.CharField(max_length=100, null=True)
    project = models.CharField(max_length=100, null=True)
    active = models.CharField(max_length=100, choices=Actives.choices, null=True)
    closed = models.CharField(max_length=100, choices=Close.choices, null=True)


class AssetModels(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "assets_models"


class AssetTypes(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "assets_types"


class AssetBrand(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "assets_brands"
