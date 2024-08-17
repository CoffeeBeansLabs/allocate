# Generated by Django 4.1.3 on 2023-01-19 04:58

from django.contrib.contenttypes.models import ContentType
from django.db import migrations

from authapp.constants import RoleKeys
from authapp.permissions import assign_permissions, revoke_permissions


def get_group_permission_map(content_type):
    group_permission_map = {
        RoleKeys.ACCOUNT_MANAGER: {
            'content_type': content_type,
            'codenames': ['delete_projectallocationrequest']
        }
    }
    return group_permission_map


def assign_group_permissions(apps, schema_editor):
    ProjectAllocationRequest = apps.get_model('project', 'ProjectAllocationRequest')
    content_type = ContentType.objects.get_for_model(ProjectAllocationRequest)
    group_permission_map = get_group_permission_map(content_type)
    assign_permissions(group_permission_map)


def revoke_group_permissions(apps, schema_editor):
    ProjectAllocationRequest = apps.get_model('project', 'ProjectAllocationRequest')
    content_type = ContentType.objects.get_for_model(ProjectAllocationRequest)
    group_permission_map = get_group_permission_map(content_type)
    revoke_permissions(group_permission_map)


class Migration(migrations.Migration):
    dependencies = [
        ("authapp", "0009_auto_20230116_0611"),
        ('project', '0007_alter_projectallocation_options_and_more')
    ]

    operations = [
        migrations.RunPython(assign_group_permissions, reverse_code=revoke_group_permissions)
    ]

