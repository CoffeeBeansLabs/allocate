from django.contrib.auth.models import Permission


def get_permission_object(permission_name):
    """
    Utility method to return permission object based on permission name.
    """
    app_label, codename = permission_name.split('.')
    return Permission.objects.filter(content_type__app_label=app_label, codename=codename).first()
