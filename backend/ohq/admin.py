from django.contrib import admin

from ohq.models import (
    Announcement,
    Course,
    CourseStatistic,
    Membership,
    MembershipInvite,
    Profile,
    Question,
    Queue,
    QueueStatistic,
    Semester,
    Tag,
    QuestionFile
)


class DisplayIdAdmin(admin.ModelAdmin):
    def get_list_display(self, request): 
        list_display = list(super().get_list_display(request))
        list_display.insert(0, 'id')
        return list_display

admin.site.register(Course, DisplayIdAdmin)
admin.site.register(CourseStatistic, DisplayIdAdmin)
admin.site.register(Membership, DisplayIdAdmin)
admin.site.register(MembershipInvite, DisplayIdAdmin)
admin.site.register(Profile, DisplayIdAdmin)
admin.site.register(Question, DisplayIdAdmin)
admin.site.register(Queue, DisplayIdAdmin)
admin.site.register(Semester, DisplayIdAdmin)
admin.site.register(QueueStatistic, DisplayIdAdmin)
admin.site.register(Announcement, DisplayIdAdmin)
admin.site.register(Tag, DisplayIdAdmin)
admin.site.register(QuestionFile, DisplayIdAdmin)