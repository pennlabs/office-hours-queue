# Office Hours Queue

![Build and Deploy](https://github.com/pennlabs/office-hours-queue/workflows/Build%20and%20Deploy/badge.svg)
[![Coverage Status](https://codecov.io/gh/pennlabs/office-hours-queue/branch/master/graph/badge.svg)](https://codecov.io/gh/pennlabs/office-hours-queue)

This repo contains an office hour queue.

### Launching the backend

Navigate to `/backend`. Then,

0. (Initial setup)

-   a. `pipenv install --dev`  
     NOTE: You might have to install openssl with Homebrew (`brew install openssl`) and set the following environment variable for the linker.  
     `export LDFLAGS="-I/usr/local/opt/openssl/include -L/usr/local/opt/openssl/lib`
-   b. `pipenv shell`
-   c. `python manage.py createsuperuser`
-   e. Ensure `python manage.py test` passes all tests.
    Note that you might have to run migrations or reinstall dependencies if the Pipfile or models have been changed upstream.

1. `docker-compose up`
2. `python manage.py runserver 8000`

### Launching the frontend

Navigate to `/frontend`. Then,

0. (Initial setup)

-   a. `yarn install`

1. `yarn dev`

Finally, you should be able to authenticate at `localhost:8000/admin` and use the application at `localhost:3000`! 🎉
