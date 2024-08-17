# Generated by Django 4.1.3 on 2022-12-13 14:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("user", "0005_user_career_start_date_user_current_status_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="Role",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.AlterField(
            model_name="proficiencymapping",
            name="rating",
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="users",
                to="user.role",
            ),
        ),
    ]