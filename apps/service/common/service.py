from common.constants import RequestKeys, ErrorMessages, ResponseKeys, EnvironmentValues
from common.models import Skill, Industry

from helpers.exceptions import InvalidRequest
from django.conf import settings
from django.db import connection


class UserSkillService:

    def create_skill(self, data):
        skill = Skill.objects.create(**data)
        return skill

    def delete_skill(self, skill_id):
        skill = Skill.objects.filter(id=skill_id)
        if not skill:
            raise InvalidRequest(ErrorMessages.INVALID_SKILL_ID)
        skill.delete()


class UserIndustryService:

    def create_industry(self, data):
        industry = Industry.objects.create(**data)
        return industry

    def list_industry(self, data):
        industry = Industry.objects.all().order_by('name')
        search = data.get(RequestKeys.SEARCH)
        if search:
            industry = industry.filter(name__icontains=search)
        return industry

    def delete_industry(self, industry_id):
        industry = Industry.objects.filter(id=industry_id)
        if not industry:
            raise InvalidRequest(ErrorMessages.INVALID_INDUSTRY_ID)
        industry.delete()


class FeatureFlagService:

    def get_feature_flags(self):
        feature_flags = dict()
        feature_flags[ResponseKeys.ASSET_MODULE] = settings.ASSET_MODULE_FEATURE_FLAG == EnvironmentValues.ENABLED
        return feature_flags


class HealthCheckService:

    def check_database_connection(self):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            return True
        except Exception:

            return False

    def get_health_status(self):
        db_status = self.check_database_connection()
        return {
            "status": db_status
        }
