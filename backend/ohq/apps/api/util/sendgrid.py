import os
from jinja2 import Template
from decouple import config
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email

from django.conf import settings

from ..models import CourseUser, InvitedCourseUser, CourseUserKind

def send_invitation_email(invited_course_user: InvitedCourseUser):
    path = os.path.join(settings.BASE_DIR, 'ohq/apps/api/emails/invitation.html')
    with open(path) as f:
        template = Template(f.read())

    formatted_course_name = (
        f"{invited_course_user.course.department} {invited_course_user.course.course_code}"
    )

    subject = f"Invitation to join {formatted_course_name}"
    title = f"Invitation to join {formatted_course_name}"
    body = f"You have been invited to join {formatted_course_name} as " \
           f"{'an' if invited_course_user.kind == CourseUserKind.ADMIN.name else 'a'} " \
           f"{CourseUserKind.to_pretty(invited_course_user.kind)} by " \
           f"{invited_course_user.invited_by.full_name}."
    body_p2 = "<p>Click below to create your account!</p>"

    html_content = template.render(
        title=title,
        body=body,
        body_p2=body_p2,
        sign_up_link="https://ohq.io",
    )
    message = Mail(
        from_email=Email("info@ohq.io", "Office Hour Queue"),
        to_emails=invited_course_user.email,
        subject=subject,
        html_content=html_content,
    )
    try:
        sg = SendGridAPIClient(config('SENDGRID_API_KEY'))
        sg.send(message)
    except Exception as e:
        print(e)


def send_added_to_course_email(course_user: CourseUser):
    path = os.path.join(settings.BASE_DIR, 'ohq/apps/api/emails/invitation.html')
    with open(path) as f:
        template = Template(f.read())

    formatted_course_name = (
        f"{course_user.course.department} {course_user.course.course_code}"
    )

    subject = f"A new course has been added to your account"
    title = f"{formatted_course_name} as been added to your account"
    body = f"You have been added to {formatted_course_name} as " \
           f"{'an' if course_user.kind == CourseUserKind.ADMIN.name else 'a'} " \
           f"{CourseUserKind.to_pretty(course_user.kind)} by " \
           f"{course_user.invited_by.full_name}."
    body_p2 = ""

    html_content = template.render(
        title=title,
        body=body,
        body_p2=body_p2,
        sign_up_link="https://ohq.io",
    )
    message = Mail(
        from_email=Email("info@ohq.io", "Office Hour Queue"),
        to_emails=course_user.user.email,
        subject=subject,
        html_content=html_content,
    )
    try:
        sg = SendGridAPIClient(config('SENDGRID_API_KEY'))
        sg.send(message)
    except Exception as e:
        print(e)
