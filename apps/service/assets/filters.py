import django_filters
from django.db import models
from django.db.models import F, ExpressionWrapper, Value
from django.db.models import OuterRef, Subquery
from django.db.models import Q
from django.db.models.functions import Concat

from assets.models import Inventory, InUseAsset


class AssetFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="search_filter")
    active_filter = django_filters.CharFilter(method="active_filter_function")
    close_filter = django_filters.CharFilter(method="close_filter_function")

    class Meta:
        model = Inventory
        fields = ("search", "archived", "active_filter", "close_filter")

    def close_filter_function(self, queryset, name, value):
        close_list = []

        for i in value[1:-1].split(","):
            close_list.append(i.strip().replace("'", ""))

        filtered_inventory = queryset.filter(related_asset__closed__in=close_list).distinct()

        return filtered_inventory

    def active_filter_function(self, queryset, name, value):
        active_list = []

        for i in value[1:-1].split(","):
            active_list.append(i.strip().replace("'", ""))

        filtered_inventory = queryset.filter(related_asset__active__in=active_list).distinct()

        return filtered_inventory

    def search_filter(self, queryset, name, value):
        assigned_name_subquery = (
            InUseAsset.objects.filter(inventory=OuterRef("pk"))
            .order_by("-date_of_change")
            .values("user__first_name", "user__last_name")[:1]
        )

        assigned_name_queryset = queryset.annotate(
            user_first_name=Subquery(assigned_name_subquery.values("user__first_name")),
            user_last_name=Subquery(assigned_name_subquery.values("user__last_name")),
            assigned_name=ExpressionWrapper(
                Concat(F("user_first_name"), Value(" "), F("user_last_name")),
                output_field=models.CharField(),
            ),
        )

        return assigned_name_queryset.filter(
            Q(type__icontains=value)
            | Q(model__icontains=value)
            | Q(serial_num__icontains=value)
            | Q(screensize__icontains=value)
            | Q(brand__icontains=value)
            | Q(assigned_name__icontains=value)
        )
