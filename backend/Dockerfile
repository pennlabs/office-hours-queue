FROM pennlabs/django-base:b269ea1613686b1ac6370154debbb741b012de1a-3.11
ARG DEPENDENCY_MANAGER="uv"

LABEL maintainer="Penn Labs"

# Install build dependencies
RUN apt-get update && apt-get install --no-install-recommends -y gcc libpq-dev libc-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
# Download the latest installer
ADD https://astral.sh/uv/0.6.0/install.sh /uv-installer.sh

RUN echo "5464b06094b6363861b99cd60a010892e52fc2a7503b7594419828e74afecfe6  /uv-installer.sh" | sha256sum -c

# Run the installer then remove it
RUN sh /uv-installer.sh && rm /uv-installer.sh

# Ensure the installed binary is on the `PATH`
ENV PATH="/root/.local/bin/:$PATH"

# Copy project dependencies
COPY Pipfile* /app/
COPY pyproject.toml /app/
COPY uv.lock /app/

# Install project dependencies using pipenv if pipenv enabled
RUN if [ "$DEPENDENCY_MANAGER" = "pipenv" ]; then pipenv install --system; fi

# Install project dependencies if using uv if uv enabled
RUN if [ "$DEPENDENCY_MANAGER" = "uv" ]; then uv sync --frozen --no-dev --no-install-project --python $(which python); fi
# Make installed binaries available for POSIX compliant scripts
ENV PATH="/app/.venv/bin:$PATH"
# Patch for scripts that use a hard-coded path to uwsgi (django-run)
RUN if [ "$DEPENDENCY_MANAGER" = "uv" ]; then  cp /app/.venv/bin/uwsgi /usr/local/bin/uwsgi; fi
# Patch for scripts that use a hard-coded path to gunicorn (asgi-run)
RUN if [ "$DEPENDENCY_MANAGER" = "uv" ]; then  cp /app/.venv/bin/gunicorn /usr/local/bin/gunicorn; fi
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
