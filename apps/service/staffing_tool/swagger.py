from drf_yasg import openapi
from drf_yasg.views import get_schema_view

schema_view = get_schema_view(
   openapi.Info(
      title="Staffing Tool API",
      default_version='v1',
      description="Staffing Tool API Documentation",
   ),
   public=True
)
