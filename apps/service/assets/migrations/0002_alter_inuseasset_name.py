# Generated by Django 4.1.3 on 2023-07-20 10:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('assets', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='inuseasset',
            name='name',
            field=models.CharField(max_length=100, null=True),
        ),
    ]