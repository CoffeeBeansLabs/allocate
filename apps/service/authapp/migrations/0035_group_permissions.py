# Generated by Django 4.1.3 on 2023-10-06 09:48

from django.contrib.contenttypes.models import ContentType
from django.db import migrations

from authapp.constants import RoleKeys
from authapp.permissions import assign_permissions, revoke_permissions


def get_group_permission_map(content_type):
    group_permission_map = {
        RoleKeys.SUPER_ADMIN: {
            'content_type': content_type,
            'codenames': ['change_group', 'view_group']
        },
    }
    return group_permission_map


def assign_group_permissions(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    content_type = ContentType.objects.get_for_model(Group)
    group_permission_map = get_group_permission_map(content_type)
    assign_permissions(group_permission_map)


def revoke_group_permissions(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    content_type = ContentType.objects.get_for_model(Group)
    group_permission_map = get_group_permission_map(content_type)
    revoke_permissions(group_permission_map)


class Migration(migrations.Migration):

    dependencies = [
        ('authapp', '0034_notifications_permissions_new_groups'),
    ]

    operations = [
        migrations.RunPython(assign_group_permissions, reverse_code=revoke_group_permissions)
    ]
