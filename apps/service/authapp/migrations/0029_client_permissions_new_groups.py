# Generated by Django 4.1.3 on 2023-10-05 06:39

from django.contrib.contenttypes.models import ContentType
from django.db import migrations

from authapp.constants import RoleKeys
from authapp.permissions import assign_permissions, revoke_permissions


def get_group_permission_map(content_type):
    group_permission_map = {
        RoleKeys.SUPER_ADMIN: {
            'content_type': content_type,
            'codenames': ['add_client', 'view_client', 'change_client', 'mark_client_dormant']
        },
        RoleKeys.VIEWER: {
            'content_type': content_type,
            'codenames': ['view_client']
        },
        RoleKeys.INVENTORY_MANAGER: {
            'content_type': content_type,
            'codenames': ['view_client']
        }
    }
    return group_permission_map


def assign_group_permissions(apps, schema_editor):
    client = apps.get_model('client', 'Client')
    content_type = ContentType.objects.get_for_model(client)
    group_permission_map = get_group_permission_map(content_type)
    assign_permissions(group_permission_map)


def revoke_group_permissions(apps, schema_editor):
    client = apps.get_model('client', 'Client')
    content_type = ContentType.objects.get_for_model(client)
    group_permission_map = get_group_permission_map(content_type)
    revoke_permissions(group_permission_map)


class Migration(migrations.Migration):
    dependencies = [
        ('authapp', '0028_user_permissions_new_groups'),
    ]

    operations = [
        migrations.RunPython(assign_group_permissions, reverse_code=revoke_group_permissions)
    ]
