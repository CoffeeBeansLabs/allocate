from rest_framework import serializers

from user.serializers import UserSerializer


class LoginRequestSerializer(serializers.Serializer):
    code = serializers.CharField()


class LoginResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()


class JWTResponseSerializer(serializers.Serializer):
    token = serializers.CharField()
