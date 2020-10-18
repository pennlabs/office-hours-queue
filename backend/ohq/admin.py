from django.contrib import admin

from ohq.models import Course, Membership, MembershipInvite, Profile, Question, Queue, Semester, Announcement


admin.site.register(Course)
admin.site.register(Membership)
admin.site.register(MembershipInvite)
admin.site.register(Profile)
admin.site.register(Question)
admin.site.register(Queue)
admin.site.register(Semester)
admin.site.register(Announcement)
