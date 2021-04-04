from django.contrib import admin

from ohq.models import (
    Announcement,
    Course,
    Membership,
    MembershipInvite,
    MembershipStatistic,
    Profile,
    Question,
    Queue,
    QueueStatistic,
    Semester,
    Tag,
)


admin.site.register(Course)
admin.site.register(Membership)
admin.site.register(MembershipInvite)
admin.site.register(MembershipStatistic)
admin.site.register(Profile)
admin.site.register(Question)
admin.site.register(Queue)
admin.site.register(Semester)
admin.site.register(QueueStatistic)
admin.site.register(Announcement)
admin.site.register(Tag)
