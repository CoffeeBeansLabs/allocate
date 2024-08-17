from django.db import models

from common.models import Industry
from user.models import User


class Client(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        DORMANT = 'DORMANT', 'Dormant'

    name = models.CharField(unique=True, max_length=100)
    status = models.CharField(
        max_length=30, choices=Status.choices, default=Status.ACTIVE)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    start_date = models.DateField()
    industry = models.ForeignKey(
        Industry, related_name='clients', on_delete=models.SET_NULL, null=True)
    created_by = models.ForeignKey(
        User, related_name='clients_created', on_delete=models.SET_NULL, null=True)
    account_manager = models.ForeignKey(
        User, related_name='clients_managed', on_delete=models.SET_NULL, null=True)
    created_time = models.DateTimeField(auto_now_add=True)
    modified_time = models.DateTimeField(auto_now=True)
    comment = models.CharField(max_length=250, null=True)

    objects = models.Manager()

    class Meta:
        db_table = 'client'
        permissions = [('mark_client_dormant', 'Can mark client dormant'),
                       ('client_account_manager', 'Can be client account manager')]


class ClientPOC(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(null=True)
    phone_number = models.CharField(max_length=20, null=True)
    designation = models.CharField(max_length=20, null=True)
    client = models.ForeignKey(
        Client, related_name='pocs', on_delete=models.CASCADE)

    objects = models.Manager()

    class Meta:
        db_table = 'client_pocs'
