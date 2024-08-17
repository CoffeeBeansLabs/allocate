# Generated by Django 4.1.3 on 2023-03-14 09:17
from django.db import migrations
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType


def create_permission(apps, schema_editor):
    content_type = ContentType.objects.create(
        app_label='edit_form',
        model='edit_form_permission',
    )
    Permission.objects.create(
        codename='can_access_form',
        name='Can access form',
        content_type=content_type,
    )


def delete_permission(apps, schema_editor):
    Permission.objects.filter(codename='can_access_form').delete()


class Migration(migrations.Migration):
    dependencies = [
        ("common", "0002_skill"),
    ]

    operations = [
        migrations.RunPython(create_permission),
    ]