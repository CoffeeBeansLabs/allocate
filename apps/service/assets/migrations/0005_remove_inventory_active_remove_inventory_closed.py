# Generated by Django 4.1.3 on 2023-07-21 04:43

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('assets', '0004_remove_inuseasset_sno_alter_inuseasset_change_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='inventory',
            name='active',
        ),
        migrations.RemoveField(
            model_name='inventory',
            name='closed',
        ),
    ]
