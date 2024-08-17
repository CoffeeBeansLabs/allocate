# Generated by Django 4.1.3 on 2023-02-07 06:53

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("contenttypes", "0002_remove_content_type_name"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("project", "0009_projectallocationrequest_allocation"),
    ]

    operations = [
        migrations.AlterField(
            model_name="project",
            name="engagement_type",
            field=models.CharField(
                choices=[("FR", "Fixed Rate"), ("TM", "Time and Material")],
                max_length=20,
                null=True,
            ),
        ),
        migrations.CreateModel(
            name="Notification",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "notification_type",
                    models.CharField(
                        choices=[
                            ("NEW_ALLOCATION_REQUEST", "New_Allocation_Request"),
                            ("ALLOCATION_CHANGE_REQUEST", "Allocation_Change_Request"),
                            ("CANCEL_ALLOCATION_REQUEST", "Cancel_Allocation_Request"),
                            (
                                "APPROVED_ALLOCATION_REQUEST",
                                "Approved_Allocation_Request",
                            ),
                            (
                                "APPROVED_ALLOCATION_CHANGE_REQUEST",
                                "Approved_Allocation_Change_Request",
                            ),
                        ],
                        max_length=50,
                        null=True,
                    ),
                ),
                ("unseen", models.BooleanField(default=True)),
                ("object_id", models.PositiveIntegerField(null=True)),
                ("json_data", models.JSONField(null=True)),
                ("created_time", models.DateTimeField(auto_now_add=True)),
                ("modified_time", models.DateTimeField(auto_now=True)),
                (
                    "content_type",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        to="contenttypes.contenttype",
                    ),
                ),
                (
                    "receiver",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="receiver",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "sender",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="sender",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "notification",
                "permissions": [("admin_notification", "Can be admin notified")],
            },
        ),
    ]