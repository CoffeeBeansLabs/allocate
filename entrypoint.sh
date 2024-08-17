#! /bin/sh

python manage.py collectstatic --no-input
python manage.py migrate --no-input

CORES=$(getconf _NPROCESSORS_ONLN)
WORKERS=$((2 * $CORES + 1))
gunicorn --workers=$WORKERS --bind=0.0.0.0:8000 staffing_tool.wsgi:application