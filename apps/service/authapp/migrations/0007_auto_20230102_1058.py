# Generated by Django 4.1.3 on 2023-01-02 10:58

from django.contrib.contenttypes.models import ContentType
from django.db import migrations

from authapp.constants import RoleKeys
from authapp.permissions import assign_permissions, revoke_permissions


def get_group_permission_map(content_type):
    group_permission_map = {
        RoleKeys.ADMIN: {
            'content_type': content_type,
            'codenames': ['add_projectallocation', 'change_projectallocation', 'delete_projectallocation',
                          'view_projectallocation']
        }
    }
    return group_permission_map


def assign_group_permissions(apps, schema_editor):
    ProjectAllocation = apps.get_model('project', 'ProjectAllocation')
    content_type = ContentType.objects.get_for_model(ProjectAllocation)
    group_permission_map = get_group_permission_map(content_type)
    assign_permissions(group_permission_map)


def revoke_group_permissions(apps, schema_editor):
    ProjectAllocation = apps.get_model('project', 'ProjectAllocation')
    content_type = ContentType.objects.get_for_model(ProjectAllocation)
    group_permission_map = get_group_permission_map(content_type)
    revoke_permissions(group_permission_map)


class Migration(migrations.Migration):

    dependencies = [
        ("authapp", "0006_auto_20221214_0928"),
        ("project", "0007_alter_projectallocation_options_and_more")
    ]

    operations = [
        migrations.RunPython(assign_group_permissions, reverse_code=revoke_group_permissions)
    ]
