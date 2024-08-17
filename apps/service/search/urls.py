from django.urls import path

from search.views import SearchTalentAPIView, QuickSearchTalentAPIView, UniversalSearchAPIView

urlpatterns = [
    path('talents/', SearchTalentAPIView.as_view(), name='search-talent'),
    path('quick-search/', QuickSearchTalentAPIView.as_view(), name='quick-search'),
    path('universal-search/', UniversalSearchAPIView.as_view(), name='universal-search')


]
