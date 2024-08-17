# Generated by Django 4.1.3 on 2022-12-30 09:14

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0006_role_alter_proficiencymapping_rating_alter_user_role'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('project', '0006_project_account_manager'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='projectallocation',
            options={},
        ),
        migrations.AlterUniqueTogether(
            name='projectallocation',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='projectposition',
            name='openings',
        ),
        migrations.RemoveField(
            model_name='projectposition',
            name='project',
        ),
        migrations.RemoveField(
            model_name='projectposition',
            name='role',
        ),
        migrations.AddField(
            model_name='projectallocation',
            name='created_time',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AddField(
            model_name='projectallocation',
            name='end_date',
            field=models.DateField(null=True),
        ),
        migrations.AddField(
            model_name='projectallocation',
            name='modified_time',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='projectallocation',
            name='start_date',
            field=models.DateField(),
        ),
        migrations.AddField(
            model_name='projectallocation',
            name='utilization',
            field=models.IntegerField(),
        ),
        migrations.AddField(
            model_name='projectposition',
            name='created_time',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AddField(
            model_name='projectposition',
            name='modified_time',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='projectallocation',
            name='kt_period',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='projectposition',
            name='experience_range_end',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='projectposition',
            name='experience_range_start',
            field=models.IntegerField(),
        ),
        migrations.AlterField(
            model_name='projectposition',
            name='start_date',
            field=models.DateField(),
        ),
        migrations.AlterField(
            model_name='projectposition',
            name='utilization',
            field=models.IntegerField(),
        ),
        migrations.CreateModel(
            name='ProjectRole',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='roles', to='project.project')),
                ('role', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='projects', to='user.role')),
            ],
            options={
                'db_table': 'project_role',
                'unique_together': {('project', 'role')},
            },
        ),
        migrations.CreateModel(
            name='ProjectPositionHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('utilization', models.IntegerField()),
                ('start_date', models.DateField()),
                ('end_date', models.DateField(null=True)),
                ('created_time', models.DateTimeField()),
                ('modified_time', models.DateTimeField()),
                ('added_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('position', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='project.projectposition')),
            ],
            options={
                'db_table': 'project_position_history',
            },
        ),
        migrations.CreateModel(
            name='ProjectAllocationRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('utilization', models.IntegerField()),
                ('start_date', models.DateField()),
                ('end_date', models.DateField(null=True)),
                ('kt_period', models.IntegerField(default=0)),
                ('tentative', models.BooleanField(default=False)),
                ('status', models.CharField(choices=[('APPROVED', 'Approved'), ('PENDING', 'Pending'), ('DENIED', 'Denied')], default='PENDING', max_length=30)),
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('handler', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='allocations_handled', to=settings.AUTH_USER_MODEL)),
                ('position', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='allocation_requests', to='project.projectposition')),
                ('requested_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='allocations_requested', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='allocation_requests', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'project_allocation_request',
            },
        ),
        migrations.RemoveField(
            model_name='projectallocation',
            name='requested',
        ),
        migrations.AddField(
            model_name='projectposition',
            name='project_role',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='positions', to='project.projectrole'),
        ),
    ]