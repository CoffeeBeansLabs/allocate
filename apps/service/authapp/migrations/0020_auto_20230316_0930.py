# Generated by Django 4.1.3 on 2023-03-16 09:30

from django.contrib.contenttypes.models import ContentType
from django.db import migrations

from authapp.constants import RoleKeys
from authapp.permissions import assign_permissions, revoke_permissions


def get_group_permission_map(content_type):
    group_permission_map = {
        RoleKeys.ADMIN: {
            'content_type': content_type,
            'codenames': ['add_industry', 'delete_industry', 'view_industry']
        }
    }
    return group_permission_map


def assign_group_permissions(apps, schema_editor):
    Industry = apps.get_model('common', 'Industry')
    content_type = ContentType.objects.get_for_model(Industry)
    group_permission_map = get_group_permission_map(content_type)
    assign_permissions(group_permission_map)


def revoke_group_permissions(apps, schema_editor):
    Industry = apps.get_model('common', 'Industry')
    content_type = ContentType.objects.get_for_model(Industry)
    group_permission_map = get_group_permission_map(content_type)
    revoke_permissions(group_permission_map)


class Migration(migrations.Migration):
    dependencies = [
        ("authapp", "0019_auto_20230316_0906"),
        ("common", "0004_auto_20230316_0858")
    ]

    operations = [
        migrations.RunPython(assign_group_permissions, reverse_code=revoke_group_permissions)
    ]