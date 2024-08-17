from django.contrib.auth.base_user import BaseUserManager
from django.db.models import Q

from utils.permissions import get_permission_object


class UserManager(BaseUserManager):
    def create_user(self, *, employee_id, email, first_name, last_name, password=None, **extra_fields):
        """
        Method to create and save a user.
        """
        user = self.model(
            email=email,
            employee_id=employee_id,
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )
        user.set_password(password)
        user.save()
        return user

    def filter_by_permission(self, permission_name):
        """
        Method to filter users by permission.
        """
        permission = get_permission_object(permission_name)
        if not permission:
            return self.none()
        return self.filter(Q(groups__permissions=permission) | Q(user_permissions=permission)).distinct()

    def filter_active(self):
        return self.filter(is_active=True)
