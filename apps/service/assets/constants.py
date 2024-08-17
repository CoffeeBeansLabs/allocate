DEFAULT_PAGE_NUMBER = 1
DEFAULT_PAGE_SIZE = 10


class RequestKeys:
    PAGE = "page"
    SIZE = "size"
    PROJECT = "project"
    LOCATION = "location"


class FilePaths:
    SCREENSHOTS = "screenshots"


class ResponseKeys:
    ASSETS = "assets"
    COUNT = "count"
    IN_USE_ASSETS = "in_use_assets"
    ASSET = "asset"
    IN_USE_ASSET = "in_use_asset"
    TIMELINE = "timeline"
    MODELS = "models"
    TYPES = "types"
    BRANDS = "brands"
    RAMS = "rams"
    SCREENS = "screens"
    ACTIVE = "active"
    CLOSE = "close"
    LEASING_COMPANY = "leasing_company"
    INVENTORY = "inventory"


class ErrorMessages:
    INVALID_ASSET = "Invalid Asset Id"
    INVALID_IN_USE_ASSET = "Asset not found or Asset not assigned to user"
    INVALID_BRAND = "Invalid Brand"
    INVALID_TYPE = "Invalid Type"
    INVALID_MODEL = "Invalid Model"
    ASSET_EXISTS = "Asset with the serial number already exists"


class PermissionKeys:
    POST = "POST"
    GET = "GET"
    PATCH = "PATCH"
    PUT = "PUT"
    DELETE = "DELETE"

    ASSET_PERMISSIONS = {
        POST: ["assets.add_inventory"],
        GET: ["assets.view_inventory"],
        PATCH: ["assets.change_inventory"],
        PUT: ["assets.change_inventory"],
        DELETE: ["assets.delete_inventory"]
    }


CLOSE_LIST = {
    "WR": "Written Off",
    "NW": "Not Working",
    "SL": "Stolen/Lost",
    "RC": "Returned to Client",
    "LC": "Returned to Leasing Company",
}
ACTIVE_LIST = {
    "INV": "Inventory",
    "ASSI": "Assigned",
    "TRAN": "In Transit",
    "REP": "In Repair",
}
