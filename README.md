# Office Hours Queue

![Build and Deploy](https://github.com/pennlabs/office-hours-queue/workflows/Build%20and%20Deploy/badge.svg)
[![Coverage Status](https://codecov.io/gh/pennlabs/office-hours-queue/branch/master/graph/badge.svg)](https://codecov.io/gh/pennlabs/office-hours-queue)

This repo contains an office hour queue.

## Setting up your development environment

### Prerequisites
- Python 3.11 (`pyenv` is recommended)
- `pipenv`
- `docker` and `docker-compose`
- Node (>)10 (`nvm` is recommended)
- Yarn 

### Launching the backend 
Navigate to `/backend`. Then,

0. (Initial setup)
  - a. `pipenv install --dev`  
        NOTE: <br />
        1. You might have to install openssl with Homebrew (`brew install openssl`) and set the following environment variable for the linker.  
        `export LDFLAGS="-I/usr/local/opt/openssl/include -L/usr/local/opt/openssl/lib"`.<br />
        If you run into `ERROR: Couldn't install package: psycopg2`, see [this](https://stackoverflow.com/questions/56796426/pipenv-consistently-failing-to-install-pyscopg2/57044429#57044429) post. If your problem is on M1, try the top 2 solutions [here](https://stackoverflow.com/questions/66888087/cannot-install-psycopg2-with-pip3-on-m1-mac). <br />
        2. You might have to install postgresql via `brew install postgresql`. If you run into the error `psql: FATAL:  role "postgres" does not exist`, you also need to run: <br />
        `createuser -s postgres` <br />
        `brew services restart postgresql` <br />
        3. If you run into the error where you cannot install `psycopg2` due to postgres errors, you can try running: `pip3 install psycopg2-binary --force-reinstall --no-cache-dir`
  - b. `pipenv shell`
1. `docker-compose up` (run this before doing any of the manage.py commands)
2. Migration commands to ensure your installation works:

If you are getting `FATAL: role "postgres" does not exist` see [this](https://stackoverflow.com/a/15309551). See the comments of the answer for your specific case.
  - a. `python manage.py migrate`
  - b. `python manage.py createsuperuser`
  - c. `python manage.py populate` to populate the database with dummy data
  - d. Ensure `python manage.py test` passes all tests.
    - Note: to run a specific test, you can run `python manage.py test tests.ohq.test_file.TestCase`. 
  Note that you might have to run migrations or reinstall dependencies if the Pipfile or models have been changed upstream.
  
3. `python manage.py runserver 8000`
4. Documentation: [localhost:8000/api/documentation](http://localhost:8000/api/documentation)

### Launching the frontend 
Navigate to `/frontend`. Then,

0. (Initial setup)
  - a. `yarn install`
1. `yarn dev`

Finally, you should be able to authenticate at [localhost:8000/admin](http://localhost:8000/admin) and use the application at [localhost:3000](http://localhost:3000)! 🎉

### Integration testing
Users from the populate script all have password `pennlabs`.

0. Run manually
  - a. Navigate to `/frontend`
  - b. `yarn cypress open`
  - c. Click on `question.spec.ts`

### Emulating the production server
This will, as best as possible, emulate the production configuration described in `/k8s/main.ts`.

1. Open a command prompt to `/backend`
2. Run `docker compose --profile proddev up`
3. Connect via `http://127.0.0.1:8000`
4. To turn it off, use `CTRL+C` and then `docker compose --profile proddev down`

Note this will reuse the postgres database stored in `/backend/postgres`. You may reset this database by turinging off the docker containers and deleting `/backend/postgres`
