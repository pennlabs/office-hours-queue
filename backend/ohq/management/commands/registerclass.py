from django.core.management.base import BaseCommand, CommandError

from ohq.invite import filter_emails, invite_emails
from ohq.models import Course, Membership, Semester


class Command(BaseCommand):
    help = "Creates a course with default settings and invites users to course"

    def add_arguments(self, parser):
        parser.add_argument("department", type=str)
        parser.add_argument("course_code", type=str)
        parser.add_argument("course_title", type=str)
        parser.add_argument(
            "term", type=str, choices=[choice[0] for choice in Semester.TERM_CHOICES]
        )
        parser.add_argument("year", type=int)
        parser.add_argument("--emails", nargs="+", type=str)
        parser.add_argument(
            "--roles", nargs="+", choices=[Membership.KIND_PROFESSOR, Membership.KIND_HEAD_TA],
        )

    def handle(self, *args, **kwargs):
        course_code = kwargs["course_code"]
        department = kwargs["department"]
        course_title = kwargs["course_title"]
        term = kwargs["term"]
        year = kwargs["year"]
        emails = kwargs["emails"]
        roles = kwargs["roles"]

        if len(emails) != len(roles):
            raise CommandError("Length of emails and roles do not match")

        semester = Semester.objects.get(year=year, term=term)
        new_course = Course.objects.create(
            course_code=course_code,
            department=department,
            course_title=course_title,
            semester=semester,
        )

        self.stdout.write(f"Created new course {department} {course_code} in {term} {year}")

        role_map = {email: role for role, email in zip(roles, emails)}

        emails = filter_emails(new_course, emails)
        groups = {Membership.KIND_PROFESSOR: [], Membership.KIND_HEAD_TA: []}
        for email in emails:
            groups[role_map[email]].append(email)

        added, invited = invite_emails(
            new_course, groups[Membership.KIND_PROFESSOR], Membership.KIND_PROFESSOR
        )
        self.stdout.write(f"Added {added} professor(s) and invited {invited} professor(s)")
        added, invited = invite_emails(
            new_course, groups[Membership.KIND_HEAD_TA], Membership.KIND_HEAD_TA
        )
        self.stdout.write(f"Added {added} Head TA(s) and invited {invited} Head TA(s)")
