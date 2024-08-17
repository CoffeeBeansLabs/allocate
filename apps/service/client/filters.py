import django_filters
from django.db.models import Q

from client.models import Client


class ClientFilter(django_filters.FilterSet):
    start_date_start = django_filters.DateFilter(field_name='start_date', lookup_expr='gte')
    start_date_end = django_filters.DateFilter(field_name='start_date', lookup_expr='lte')
    search = django_filters.CharFilter(method='search_filter')

    class Meta:
        model = Client
        fields = ('status', 'start_date_start', 'start_date_end', 'search')

    def search_filter(self, queryset, name, value):
        return queryset.filter(Q(name__icontains=value) | Q(industry__name__icontains=value))
