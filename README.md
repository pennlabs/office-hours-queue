# Office Hours Queue

![Build and Deploy](https://github.com/pennlabs/office-hours-queue/workflows/Build%20and%20Deploy/badge.svg)
[![Coverage Status](https://codecov.io/gh/pennlabs/office-hours-queue/branch/master/graph/badge.svg)](https://codecov.io/gh/pennlabs/office-hours-queue)

This repo contains an office hour queue.

## Setting up your development environment

### Prerequisites
- Python 3.7 (`pyenv` is recommended)
- `pipenv`
- `docker` and `docker-compose`
- Node (>)10 (`nvm` is recommended)
- Yarn 

### Launching the backend 
Navigate to `/backend`. Then,

0. (Initial setup)
  - a. `pipenv install --dev`  
        NOTE: You might have to install openssl with Homebrew (`brew install openssl`) and set the following environment variable for the linker.  
        `export LDFLAGS="-I/usr/local/opt/openssl/include -L/usr/local/opt/openssl/lib`.<br>
        If you run into `ERROR: Couldn't install package: psycopg2`, see [this](https://stackoverflow.com/questions/56796426/pipenv-consistently-failing-to-install-pyscopg2/57044429#57044429) post
  - b. `pipenv shell`
  - c. `python manage.py createsuperuser`
  - d. `python manage.py migrate`
  - e. `python manage.py populate` to populate the database with dummy data
  - f. Ensure `python manage.py test` passes all tests.
  Note that you might have to run migrations or reinstall dependencies if the Pipfile or models have been changed upstream.
  
1. `docker-compose up` (run this before doing any of the manage.py commands)
2. `python manage.py runserver 8000`

### Launching the frontend 
Navigate to `/frontend`. Then,

0. (Initial setup)
  - a. `yarn install`
1. `yarn dev`

Finally, you should be able to authenticate at [localhost:8000/admin](http://localhost:8000/admin) and use the application at [localhost:3000](http://localhost:3000)! 🎉

