from rest_framework import serializers

from client.constants import DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE
from client.models import Client, ClientPOC
from common.models import Industry
from common.serializers import IndustrySerializer
from user.models import User
from user.serializers import AccountManagerSerializer
from utils.utils import camel_to_snake


class ClientPOCSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientPOC
        fields = ('name', 'email', 'phone_number', 'designation')


class CreateClientRequestSerializer(serializers.ModelSerializer):
    industry = serializers.PrimaryKeyRelatedField(queryset=Industry.objects.all(), required=True)
    pocs = ClientPOCSerializer(many=True, required=False)

    class Meta:
        model = Client
        fields = ('name', 'status', 'city', 'country', 'industry', 'start_date', 'account_manager', 'pocs', 'comment')


class EditClientRequestSerializer(serializers.ModelSerializer):
    name = serializers.CharField()
    industry = serializers.PrimaryKeyRelatedField(queryset=Industry.objects.all(), required=True)
    account_manager = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=True, allow_null=True)
    pocs = ClientPOCSerializer(many=True, required=True)

    class Meta:
        model = Client
        fields = ('name', 'status', 'city', 'country', 'industry', 'start_date', 'account_manager', 'pocs', 'comment')


class SetClientResponseSerializer(serializers.ModelSerializer):
    industry = IndustrySerializer()
    account_manager = AccountManagerSerializer()
    pocs = ClientPOCSerializer(many=True)

    class Meta:
        model = Client
        fields = ('id', 'name', 'status', 'city', 'country', 'industry', 'start_date', 'account_manager', 'pocs',
                  'comment')


class ListClientsRequestSerializer(serializers.Serializer):
    status = serializers.ChoiceField(Client.Status.choices, default=Client.Status.ACTIVE)
    startDateStart = serializers.DateField(required=False)
    startDateEnd = serializers.DateField(required=False)
    search = serializers.CharField(required=False)
    page = serializers.IntegerField(default=DEFAULT_PAGE_NUMBER)
    size = serializers.IntegerField(default=DEFAULT_PAGE_SIZE)
    sort_by = serializers.CharField(required=False)

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        return {camel_to_snake(attr): value for attr, value in data.items()}


class ListClientsResponseSerializer(serializers.ModelSerializer):
    industry = IndustrySerializer()

    class Meta:
        model = Client
        fields = ('id', 'name', 'start_date', 'industry')


class RetrieveClientResponseSerializer(serializers.ModelSerializer):
    industry = IndustrySerializer()
    account_manager = AccountManagerSerializer()
    pocs = ClientPOCSerializer(many=True)
    projects = serializers.SerializerMethodField()

    def get_projects(self, instance):
        from project.serializers import ClientDetailProjectSerializer
        return ClientDetailProjectSerializer(instance.projects, many=True).data

    class Meta:
        model = Client
        fields = ('id', 'name', 'status', 'city', 'country', 'industry', 'start_date', 'account_manager', 'pocs',
                  'projects', 'comment')


class ClientCreationDropdownsResponseSerializer(serializers.Serializer):
    status = serializers.ListField(child=serializers.DictField())
    industries = IndustrySerializer(many=True)
    account_managers = AccountManagerSerializer(many=True)


class ProjectClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ('id', 'name')
