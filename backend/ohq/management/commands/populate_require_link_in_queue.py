from django.core.management.base import BaseCommand

from ohq.models import Course, Queue


class Command(BaseCommand):
    # this command should only be run once to migrate from having
    # require_video_chat_url attribute in the Course model to having it in the Queue model
    help = """
    One time command to populate require_video_chat_url column in Queue
    instance with value in Course instance that Queue belongs to
    """

    def handle(self, *args, **kwargs):
        all_courses = Course.objects.all()
        for course in all_courses:
            queues = Queue.objects.filter(course=course)
            for queue in queues:
                queue.require_video_chat_url_on_questions = (
                    course.require_video_chat_url_on_questions
                )
                queue.save()
                print("updated queue {} in course {}".format(queue.name, course.course_code))
