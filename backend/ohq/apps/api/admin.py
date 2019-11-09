from django.contrib import admin

from .models import *

admin.site.register(User)
admin.site.register(Course)
admin.site.register(CourseUser)
admin.site.register(Queue)
admin.site.register(Question)
admin.site.register(FeedbackQuestion)
admin.site.register(FeedbackAnswer)

