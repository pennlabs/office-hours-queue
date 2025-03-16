FROM pennlabs/django-base:b269ea1613686b1ac6370154debbb741b012de1a-3.11
ARG DEPENDENCY_MANAGER="pipenv"

LABEL maintainer="Penn Labs"

# Install uv
COPY --from=ghcr.io/astral-sh/uv@sha256:2381d6aa60c326b71fd40023f921a0a3b8f91b14d5db6b90402e65a635053709 /uv /uvx /bin/

# Copy project dependencies
COPY Pipfile* pyproject.toml uv.lock /app/

# Install dependencies using uv or pipenv depending on DEPENDENCY_MANAGER arg
RUN if [ "$DEPENDENCY_MANAGER" = "uv" ]; then \
    uv sync --frozen --no-dev --no-install-project --python $(which python); \
    mv /app/.venv/bin/uwsgi /usr/local/bin/uwsgi; \
    mv /app/.venv/bin/gunicorn /usr/local/bin/gunicorn; \
else \
    pipenv install --system; \
fi

# Make installed binaries available for POSIX compliant scripts
ENV PATH="/app/.venv/bin:$PATH"

# Patch for scripts that use a hard-coded path to python (django-run, asgi-run)
ENV PYTHONPATH="/app/.venv/lib/python3.11/site-packages/:$PYTHONPATH"

# Copy project files
COPY . /app/

ENV DJANGO_SETTINGS_MODULE officehoursqueue.settings.production
ENV SECRET_KEY 'temporary key just to build the docker image'

# Copy custom asgi-run
COPY ./scripts/asgi-run /usr/local/bin/

# Collect static files
RUN python3 /app/manage.py collectstatic --noinput
