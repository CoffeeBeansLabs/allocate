import os
from datetime import datetime

import jwt
import requests
from django.conf import settings
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

from authapp.constants import ResponseKeys, URLs, ErrorMessages, PermissionKeys
from authapp.constants import RoleKeys
from helpers.exceptions import ServerException
from user.models import User
from utils.log import log_error, log_message


class LoginService:
    def login(self, code):
        """
        Method to authenticate a user and generate a token.
        """
        auth_token = self.get_access_token_google(code)
        user_info = self.get_user_info_google(auth_token)

        user = User.objects.filter(email=user_info['email']).first()
        self.authenticate_internally(user)
        if user.groups.filter(Q(id=1) | Q(id=2)):
            user.last_login = timezone.now()
        user.save()

        token = self.generate_token(user)
        user.picture = user_info.get('picture')
        return {
            **token,
            ResponseKeys.USER: user
        }

    def get_access_token_google(self, code):
        """
        Method to get access token from Google in exchange for code.
        """
        # reference: https://www.hacksoft.io/blog/google-oauth2-with-django-react-part-2
        # reference: https://developers.google.com/identity/protocols/oauth2/web-server#obtainingaccesstokens
        data = {
            'code': code,
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'redirect_uri': settings.BASE_FRONTEND_URL,
            'grant_type': 'authorization_code'
        }
        response = requests.post(URLs.GOOGLE_TOKEN_URL, data=data)
        if not response.ok:
            log_error(response.json())
            raise AuthenticationFailed(
                ErrorMessages.GOOGLE_AUTHENTICATION_FAILED)
        access_token = response.json()['access_token']
        return access_token

    def get_user_info_google(self, access_token):
        """
        Method to get user info from Google.
        """
        params = {'access_token': access_token}
        response = requests.get(URLs.GOOGLE_USER_INFO_URL, params=params)
        log_message(response.json())
        if not response.ok:
            raise ServerException()
        return response.json()

    def authenticate_internally(self, user):
        """
        Method to check if user is authorized to use our application.
        """
        if user and user.is_active and user.has_perm(PermissionKeys.LOGIN_PERMISSION):
            return
        raise AuthenticationFailed(ErrorMessages.UNAUTHORIZED_LOGIN)

    def generate_token(self, user):
        """
        Method to generate token (JWT) for given user.
        """
        refresh_token = RefreshToken.for_user(user)
        return {
            ResponseKeys.ACCESS: str(refresh_token.access_token),
            ResponseKeys.REFRESH: str(refresh_token)
        }


class JWTService:
    def generate_hasura_jwt(self, user):
        data = {
            "sub": str(user.id),
            "name": user.full_name,
            "iat": datetime.utcnow(),
            "https://hasura.io/jwt/claims": {
                "x-hasura-allowed-roles": [RoleKeys.REQUESTER],
                "x-hasura-default-role": user.user_role,
            },
        }

        token = jwt.encode(
            data, os.environ.get("HASURA_SIGNING_SECRET"), algorithm="HS256"
        )
        return {"token": token}
