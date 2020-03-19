import re
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

def generate_sms_verification_code():
    return ''.join(random.choice(string.digits) for _ in range(6))

def sorted_alphanumeric(l):
    convert = lambda text: int(text) if text.isdigit() else text
    alphanum_key = lambda key: [convert(c) for c in re.split('([0-9]+)', key)]
    return sorted(l, key=alphanum_key)
