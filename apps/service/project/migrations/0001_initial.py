# Generated by Django 4.1.3 on 2022-12-09 10:20

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('client', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('status', models.CharField(choices=[('COLD', 'Cold'), ('WARM', 'Warm'), ('HOT', 'Hot'), ('SIGNED', 'Signed'), ('ACTIVE', 'Active'), ('CLOSED', 'Closed')], max_length=30)),
                ('city', models.CharField(max_length=100)),
                ('country', models.CharField(max_length=100)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField(null=True)),
                ('currency', models.CharField(max_length=50, null=True)),
                ('engagement_type', models.CharField(choices=[('FR', 'Fixed Rate'), ('TM', 'Time and Materials')], max_length=20, null=True)),
                ('delivery_mode', models.CharField(choices=[('ONSITE', 'Onsite'), ('HYBRID', 'Hybrid'), ('REMOTE', 'Remote')], max_length=20, null=True)),
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='projects', to='client.client')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='projects_created', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'project',
                'permissions': [('set_privileged_project_status', 'Can set privileged project status')],
            },
        ),
        migrations.CreateModel(
            name='ProjectPOC',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('phone_number', models.CharField(max_length=20)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pocs', to='project.project')),
            ],
            options={
                'db_table': 'project_pocs',
            },
        ),
    ]