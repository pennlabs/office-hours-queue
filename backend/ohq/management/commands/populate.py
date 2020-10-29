import datetime

import requests
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from options.models import Option

from ohq.models import Course, Membership, MembershipInvite, Question, Queue, Semester

#assign question a user at the end + responded to by user
# members field for course
# asked_by and responded_to_by for question


courses = [
    {
        "course_code": "199",
        "department": "CIS",
        "course_title": "Kevin's Leg",
        "description": "Examining the wonders of Kevin's beautiful leg.",
        "queues": [
            {
                "name": "Leg-related Questions",
                "description": "Have a question about Kevin's leg? Ask here!",
                "archived": False,
                "estimated_wait_time": 100,
                "active": True,
                "questions": 
                [   
                    {
                        "text": "How many joints does Kevin's leg have?",
                        "video_chat_url": "https://upenn.zoom.us/j/adsjfasdkjfaqiowdjf308220740182aldskjf",
                        "status": Question.STATUS_ACTIVE,
                        "time_asked": datetime.datetime.now() - datetime.timedelta(minutes=48),
                        "time_response_started": datetime.datetime.now() - datetime.timedelta(minutes=30),
                        "time_responded_to": datetime.datetime.now() - datetime.timedelta(minutes=10),
                        "should_send_up_soon_notification": True,
                    },
                ]
            },
        ],
        "semester": {"year": 2020, "term": Semester.TERM_SUMMER},
        "archived": False,
        "invite_only": False,
        "video_chat_enabled": False,
        "require_video_chat_url_on_questions": True,
    },

    {
        "course_code": "101",
        "department": "OIDD",
        "course_title": "Code Coverage",
        "description": "Professor Davis shows the entire Penn Labs team how to code coverage :)",
        "queues": [
            {
                "name": "Questions that Armaan has for Davis",
                "description": "Code Coverage is important!",
                "archived": False,
                "estimated_wait_time": 1,
                "active": True,
                "questions": 
                [   
                    {
                        "text": "How do I code coverage, almight Davis?",
                        "video_chat_url": "https://upenn.zoom.us/j/adsjfasdkjfaqiowdskjf",
                        "status": Question.STATUS_REJECTED,
                        "time_asked": datetime.datetime.now() - datetime.timedelta(minutes=121),
                        "time_response_started": datetime.datetime.now() - datetime.timedelta(minutes=12),
                        "time_responded_to": datetime.datetime.now() - datetime.timedelta(minutes=12),
                        "rejected_reason": "NOT_SPECIFIC",
                        "should_send_up_soon_notification": False,
                    },
                ]
            },
        ] 
        "semester": {"year": 2020, "term": Semester.TERM_FALL},
        "archived": False,
        "invite_only": False,
        "video_chat_enabled": False,
        "require_video_chat_url_on_questions": True,
    },
]

class Command(BaseCommand):
    help = "Populates the development environment with dummy data."

    def handle (self, *args, **kwargs):

        # not sure if this line is neccessary / works
        if Course.objects.filter(course_title="Example Queues for OHQ").exists():
            raise CommandError("You probably do not want to run this script in production!")

        # create courses
        for info in courses:
            partial = dict(info)
            custom_fields = [
                "course_code",
                "queues",
            ]
            for field in custom_fields:
                if field in partial:
                    del partial[field]

            course, _ = Course.objects.get_or_create(course_code=info["course_code"], defaults=partial)





