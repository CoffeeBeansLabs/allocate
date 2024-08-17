import django_filters
from django.db.models import Q

from project.models import Project


class ProjectFilter(django_filters.FilterSet):
    start_date_start = django_filters.DateFilter(field_name='start_date', lookup_expr='gte')
    start_date_end = django_filters.DateFilter(field_name='start_date', lookup_expr='lte')
    search = django_filters.CharFilter(method='search_filter')

    class Meta:
        model = Project
        fields = ('status', 'start_date_start', 'start_date_end', 'search')

    def search_filter(self, queryset, name, value):
        return queryset.filter(Q(name__icontains=value) | Q(client__name__icontains=value))
