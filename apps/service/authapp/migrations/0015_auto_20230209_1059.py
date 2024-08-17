# Generated by Django 4.1.3 on 2023-02-09 10:59

from django.contrib.contenttypes.models import ContentType
from django.db import migrations

from authapp.constants import RoleKeys
from authapp.permissions import assign_permissions, revoke_permissions


def get_group_permission_map(content_type):
    group_permission_map = {
        RoleKeys.ACCOUNT_MANAGER: {
            'content_type': content_type,
            'codenames': ['admin_notification']
        }
    }
    return group_permission_map


def assign_group_permissions(apps, schema_editor):
    Notification = apps.get_model('project', 'Notification')
    content_type = ContentType.objects.get_for_model(Notification)
    group_permission_map = get_group_permission_map(content_type)
    assign_permissions(group_permission_map)


def revoke_group_permissions(apps, schema_editor):
    Notification = apps.get_model('project', 'Notification')
    content_type = ContentType.objects.get_for_model(Notification)
    group_permission_map = get_group_permission_map(content_type)
    revoke_permissions(group_permission_map)


class Migration(migrations.Migration):

    dependencies = [
        ("authapp", "0014_auto_20230207_0653"),
    ]

    operations = [
        migrations.RunPython(revoke_group_permissions, reverse_code=assign_group_permissions)
    ]