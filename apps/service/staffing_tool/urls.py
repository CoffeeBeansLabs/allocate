from django.conf import settings
from django.urls import path, include

from staffing_tool.swagger import schema_view

handler400 = 'rest_framework.exceptions.bad_request'
handler500 = 'rest_framework.exceptions.server_error'

v1_patterns = [
    path('auth/', include(('authapp.urls', 'authapp'), namespace='authapp')),
    path('clients/', include(('client.urls', 'client'), namespace='client')),
    path('projects/', include(('project.urls', 'project'), namespace='project')),
    path('search/', include(('search.urls', 'search'), namespace='search')),
    path('user/', include(('user.urls', 'user'), namespace='user')),
    path('common/', include(('common.urls', 'common'), namespace='common')),
    path('dashboard/', include(('dashboard.urls', 'dashboard'), namespace='dashboard')),
    path('report/', include(('report.urls', 'report'), namespace='report')),
    path('assets/', include(("assets.urls", 'assets'), namespace="assets"))
]

urlpatterns = [
    path('api/v1/', include((v1_patterns, 'v1'), namespace='v1')),
]

if settings.DEBUG:
    urlpatterns += [
        path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    ]
