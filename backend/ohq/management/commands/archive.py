from django.core.management.base import BaseCommand

from ohq.models import Course, Semester


class Command(BaseCommand):
    help = "Creates a course with default settings and invites users to course"

    def add_arguments(self, parser):
        parser.add_argument(
            "term", type=str, choices=[choice[0] for choice in Semester.TERM_CHOICES]
        )
        parser.add_argument("year", type=int)

    def handle(self, *args, **kwargs):
        term = kwargs["term"]
        year = kwargs["year"]

        courses = Course.objects.filter(semester__year=year, semester__term=term)
        for course in courses:
            course.archived = True
            course.save()

        self.stdout.write(f"{len(courses)} course(s) archived")
