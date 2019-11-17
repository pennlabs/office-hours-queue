## Backend

### Set up

#### Install Cloud SDK
https://cloud.google.com/sdk/docs/

#### Install Cloud SQL Proxy
https://cloud.google.com/sql/docs/postgres/sql-proxy

#### Virtual environment
Requires Python 3.8 https://github.com/pyenv/pyenv

Install requirements with `pip install -r requirements.txt`

Download the environment variables file (ask `cdf` for it)

#### Start SQL Proxy 
`./cloud_sql_proxy -instances="office-hour-q:us-east4:ohq-db"=tcp:5432`

#### Start Local Web Server
 `python manage.py runserver`

### Deploying

1. `python manage.py makemigrations`
2. `python manage.py migrate`
2. `python manage.py collectstatic`
3. `gsutil rsync -R static/ gs://ohq-api-admin/static`
4. `gcloud app deploy`
