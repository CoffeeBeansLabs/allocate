from django.db.models import Func


class AddYearInterval(Func):
    function = "INTERVAL"
    template = "(%(expressions)s * %(function)s '1' YEAR)"
