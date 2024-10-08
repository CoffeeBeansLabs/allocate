# Generated by Django 4.1.3 on 2023-12-15 12:46

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("assets", "0007_remove_inuseasset_cb_asset_id_inventory_cb_asset_id"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="inuseasset",
            name="serial_num",
        ),
        migrations.AddField(
            model_name="inuseasset",
            name="inventory",
            field=models.ForeignKey(
                default="ASSET_1",
                on_delete=django.db.models.deletion.CASCADE,
                related_name="related_asset",
                to="assets.inventory",
            ),
        ),
        migrations.AlterField(
            model_name="inventory",
            name="brand",
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name="inventory",
            name="ownership",
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name="inventory",
            name="screensize",
            field=models.CharField(max_length=100),
        ),
    ]
