import os
import re
from datetime import timedelta

from google.cloud import storage

GCS_BUCKET = os.environ.get('GCS_BUCKET')
GCS_KEY = os.environ.get('GCS_KEY')


def camel_to_snake(string):
    """
    Utility method to convert string from camel case to snake case.
    """
    return re.sub(r'(?<!^)(?=[A-Z])', '_', string).lower()


def months_difference(start_date, end_date):
    years_diff = end_date.year - start_date.year
    months_diff = end_date.month - start_date.month
    days_diff = (end_date.day - start_date.day) + 1

    if days_diff < 0:
        months_diff -= 1
        prev_month_last_day = start_date.replace(day=1) - timedelta(days=1)
        days_diff += (prev_month_last_day.day - start_date.day + 1)

    return years_diff * 12 + months_diff


def upload_to_bucket(image, folder, filename):
    client = storage.Client.from_service_account_json(GCS_KEY)
    bucket = client.get_bucket(GCS_BUCKET)

    file = f'{folder}/{filename}'
    blob = bucket.blob(file)
    blob.upload_from_file(image, content_type='image/jpeg')


def fetch_from_bucket(folder, filename):
    client = storage.Client.from_service_account_json(GCS_KEY)
    bucket = client.get_bucket(GCS_BUCKET)

    file = f'{folder}/{filename}'
    blob = bucket.blob(file)
    image_string = blob.download_as_string()
    return image_string
