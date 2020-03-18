import random
import string

def validate_day_of_week(d):
    return d in ["M", "T", "W", "R", "F", "S", "N"]

def validate_minutes_in_day(m):
    return m >= 0 and m < 60 * 24

def generate_random_pretty_id():
    return ''.join(
        random.choice(string.ascii_lowercase + string.ascii_uppercase + string.digits)
        for _ in
        range(8)
    )
