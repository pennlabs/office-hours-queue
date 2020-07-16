from django.urls import path
from rest_framework_nested import routers

from ohq.views import (
    CourseViewSet,
    MembershipInviteViewSet,
    MembershipViewSet,
    QuestionViewSet,
    QueueViewSet,
    SemesterViewSet,
    UserViews,
)


router = routers.SimpleRouter()
router.register("semesters", SemesterViewSet, basename="semester")
router.register("courses", CourseViewSet, basename="course")

course_router = routers.NestedSimpleRouter(router, "courses", lookup="course")
course_router.register("queues", QueueViewSet, basename="queue")
course_router.register("members", MembershipViewSet, basename="member")
course_router.register("invites", MembershipInviteViewSet, basename="invite")

queue_router = routers.NestedSimpleRouter(course_router, "queues", lookup="queue")
queue_router.register("questions", QuestionViewSet, basename="question")

additional_urls = [
    path("me/", UserViews.as_view(), name="me"),
]

urlpatterns = router.urls + course_router.urls + queue_router.urls + additional_urls
