# Generated by Django 4.1.3 on 2023-02-08 09:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("project", "0010_alter_project_engagement_type_notification"),
    ]

    operations = [
        migrations.AlterField(
            model_name="notification",
            name="notification_type",
            field=models.CharField(
                choices=[
                    ("NEW_ALLOCATION_REQUEST", "New_Allocation_Request"),
                    ("NEW_ALLOCATION", "New_Allocation"),
                    ("ALLOCATION_CHANGE_REQUEST", "Allocation_Change_Request"),
                    ("ALLOCATION_CHANGE", "Allocation_Change"),
                    ("CANCEL_ALLOCATION_REQUEST", "Cancel_Allocation_Request"),
                    ("APPROVED_ALLOCATION_REQUEST", "Approved_Allocation_Request"),
                    (
                        "APPROVED_ALLOCATION_CHANGE_REQUEST",
                        "Approved_Allocation_Change_Request",
                    ),
                ],
                max_length=50,
                null=True,
            ),
        ),
    ]