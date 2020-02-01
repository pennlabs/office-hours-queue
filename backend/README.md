## Backend

### Set up

#### Virtual environment
Requires Python 3.8 https://github.com/pyenv/pyenv

Install requirements with `pip install -r requirements.txt`

Download the environment variables file (ask `cdf` for it)

#### Start Local Web Server
 `python manage.py runserver`

### Deploying

1. `python manage.py makemigrations`
2. `python manage.py migrate`
2. `python manage.py collectstatic`
3. `sh deploy.sh`
