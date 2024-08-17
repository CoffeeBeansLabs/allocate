from rest_framework import serializers

from common.models import Industry, Skill


class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = ('id', 'name')


class IndustryRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = ('name',)


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ('id', 'name')


class SkillRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ('name',)


class IndustryListRequestSerializer(serializers.Serializer):
    search = serializers.CharField(required=False)
