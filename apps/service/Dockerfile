FROM python:3.10.10

ENV POETRY_VIRTUALENVS_CREATE=false

RUN apt-get update &&  \
    apt-get -y install libpq-dev gcc

RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:$PATH"

WORKDIR /app

#COPY ./apps/service/poetry.lock ./apps/service/pyproject.toml ./entrypoint.sh /app/
COPY ./apps/service /app
COPY ./entrypoint.sh /app/
RUN poetry install --no-interaction --no-ansi

ENTRYPOINT ["sh", "./entrypoint.sh"]
