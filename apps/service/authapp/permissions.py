from django.contrib.auth.models import Group, Permission
from django.core.exceptions import ImproperlyConfigured
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.permissions import BasePermission


def assign_permissions(group_permission_map):
    """
    Method to assign permissions to groups.
    """
    # https://stackoverflow.com/questions/42773498/django-permissions-new-permission-is-inserted-after-all-other-migrations
    for group_name, permissions_map in group_permission_map.items():
        group = Group.objects.filter(name=group_name).first()
        if not group:
            continue
        content_type = permissions_map['content_type']
        for codename in permissions_map['codenames']:
            permission, _ = Permission.objects.get_or_create(content_type=content_type, codename=codename)
            group.permissions.add(permission)


def revoke_permissions(group_permission_map):
    """
    Method to revoke permissions from groups.
    """
    for group_name, permissions_map in group_permission_map.items():
        group = Group.objects.filter(name=group_name).first()
        if not group:
            continue
        content_type = permissions_map['content_type']
        codenames = permissions_map['codenames']
        permissions = Permission.objects.filter(content_type=content_type, codename__in=codenames)
        group.permissions.remove(*permissions)


class APIPermission(BasePermission):
    def get_permissions(self, view, method):
        """
        Method to return the permissions required for given method.
        """
        permissions = getattr(view, 'permissions', None)
        if permissions is None:
            raise ImproperlyConfigured(f'Please define the permissions attribute '
                                       f'in order to use {self.__class__.__name__}.')
        if method not in permissions:
            raise MethodNotAllowed(method)
        return permissions[method]

    def has_permission(self, request, view):
        """
        Method to check if user has permission to access the given view.
        """
        perms = self.get_permissions(view, request.method)
        return request.user.has_perms(perms)
