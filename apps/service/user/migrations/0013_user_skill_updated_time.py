# Generated by Django 4.1.3 on 2023-03-27 10:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("user", "0012_user_date_of_birth"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="skill_updated_time",
            field=models.DateTimeField(null=True),
        ),
    ]
