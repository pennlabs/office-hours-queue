from django.urls import path
from rest_framework_nested import routers

from ohq.views import (
    CourseViewSet,
    MassInviteView,
    MembershipInviteViewSet,
    MembershipViewSet,
    QuestionSearchView,
    QuestionViewSet,
    QueueViewSet,
    ResendNotificationView,
    SemesterViewSet,
    UserView,
    AnnouncementViewSet
)


app_name = "ohq"

router = routers.SimpleRouter()
router.register("semesters", SemesterViewSet, basename="semester")
router.register("courses", CourseViewSet, basename="course")

course_router = routers.NestedSimpleRouter(router, "courses", lookup="course")
course_router.register("queues", QueueViewSet, basename="queue")
course_router.register("members", MembershipViewSet, basename="member")
course_router.register("invites", MembershipInviteViewSet, basename="invite")
course_router.register("announcements", AnnouncementViewSet, basename="announcement")

queue_router = routers.NestedSimpleRouter(course_router, "queues", lookup="queue")
queue_router.register("questions", QuestionViewSet, basename="question")

additional_urls = [
    path("accounts/me/", UserView.as_view(), name="me"),
    path("accounts/me/resend/", ResendNotificationView.as_view(), name="resend"),
    path("courses/<slug:course_pk>/mass-invite/", MassInviteView.as_view(), name="mass-invite"),
    path(
        "courses/<slug:course_pk>/questions/", QuestionSearchView.as_view(), name="questionsearch"
    ),
]

urlpatterns = router.urls + course_router.urls + queue_router.urls + additional_urls
