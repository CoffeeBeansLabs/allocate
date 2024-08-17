import django_filters
from django.db.models import Q

from user.models import User


class UserFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='search_filter')
    status = django_filters.CharFilter(method='status_filter')
    locations = django_filters.CharFilter(method='locations_filter')

    class Meta:
        model = User
        fields = ('search', 'status')

    def search_filter(self, queryset, name, value):
        return queryset.filter(
            Q(user_name__icontains=value) | Q(role__name__icontains=value) | Q(employee_id__icontains=value))

    def status_filter(self, queryset, name, value):
        values_list = []
        for i in value[1:-1].split(","):
            values_list.append(i.strip()[1:-1])
        if "All" in values_list:
            return queryset.filter()
        return queryset.filter(current_status__in=values_list)

    def locations_filter(self, queryset, name, value):
        location_filters = Q()
        for i in value[1:-1].split(","):
            location = i.strip()[1:-1]
            location_filters |= Q(work_location__iexact=location)
        return queryset.filter(location_filters)


class UserManagementFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='search_filter')

    class Meta:
        model = User
        fields = ('search',)

    def search_filter(self, queryset, name, value):
        return queryset.filter(
            Q(user_name__icontains=value) | Q(employee_id__icontains=value))
