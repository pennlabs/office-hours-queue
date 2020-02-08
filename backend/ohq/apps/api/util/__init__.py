def validateDayOfWeek(d):
    return d in ["M", "T", "W", "R", "F", "S", "N"]

def validateMinutesInDay(m):
    return m >= 0 and m < 60 * 24
