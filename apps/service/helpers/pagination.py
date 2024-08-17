from django.core.paginator import Paginator


def paginate(objects, page, size):
    """
    Method to paginate objects as per given page and size.
    """
    paginator = Paginator(objects, size)
    page = paginator.get_page(page)
    return page
