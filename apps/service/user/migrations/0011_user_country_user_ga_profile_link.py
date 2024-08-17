# Generated by Django 4.1.3 on 2023-03-06 08:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("user", "0010_rename_profile_link_user_cb_profile_link"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="country",
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AddField(
            model_name="user",
            name="ga_profile_link",
            field=models.URLField(null=True),
        ),
    ]