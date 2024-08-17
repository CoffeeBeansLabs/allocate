# Generated by Django 4.1.3 on 2024-01-02 10:49

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("assets", "0013_remove_inuseasset_name"),
    ]

    operations = [
        migrations.AlterField(
            model_name="inuseasset",
            name="inventory",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="related_asset",
                to="assets.inventory",
            ),
        ),
    ]
