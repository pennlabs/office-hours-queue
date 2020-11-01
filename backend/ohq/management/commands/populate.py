import datetime

import requests
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from ohq.models import Course, Membership, MembershipInvite, Question, Queue, Semester

now = timezone.now()

courses = [
    {
        "course_code": "199",
        "department": "CIS",
        "course_title": "Kevin's Kevin",
        "description": "Examining the wonders of Kevin.",
        "queues": [
            {
                "name": "Kevin-related Questions",
                "description": "Have a question about Kevin? Ask here!",
                "archived": False,
                "estimated_wait_time": 100,
                "active": True,
                "questions": 
                [   
                    {
                        "text": "How many joints does Kevin's leg have?",
                        "video_chat_url": "https://upenn.zoom.us/j/adsjfasdkjfaqiowdjf308220740182aldskjf",
                        "status": Question.STATUS_ACTIVE,
                        "time_asked": now - datetime.timedelta(minutes=48),
                        "time_response_started": now - datetime.timedelta(minutes=30),
                        "time_responded_to": now - datetime.timedelta(minutes=10),
                        "should_send_up_soon_notification": True,
                    },
                ]
            },
        ],
        "semester": {'year':2020, 'term': Semester.TERM_FALL},
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
                        "time_asked": now - datetime.timedelta(minutes=121),
                        "time_response_started": now - datetime.timedelta(minutes=12),
                        "time_responded_to": now - datetime.timedelta(minutes=12),
                        "rejected_reason": "NOT_SPECIFIC",
                        "should_send_up_soon_notification": False,
                    },
                ]
            },
        ], 
        "semester": {'year':2020, 'term': Semester.TERM_SUMMER},
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
        
        # tell them we have a rando / course
        # DON'T FORGET TO CREATE THE USER PROFILE & MEMBERSHIP INVITE
        # create one as a superuser
        # ask what "last active" means for membership
        # tjefferson & jmadison & jzhang password is armaan123
        # __self__ for question ?
        # members in courses? add the members there too?
        # professors can join their own class as student ? doesn't show up as instructor courses

        # create users
        count = 0
        schools = ["seas", "nursing", "wharton", "sas"]
        users = [
            "Benjamin Franklin",
            "George Washington",
            "John Adams",
            "Thomas Jefferson",
            "James Madison",
            "James Monroe",
            "John Quincy Adams",
            "Andrew Jackson",
            "Kevin Chen",
            "Justin Zhang",
            "Armaan Davis"
        ]
        user_objs = []
        for user in users:
            first, last = user.split(" ", 1)
            last = last.replace(" ", "")
            username = "{}{}".format(first[0], last).lower()
            email = "{}@{}.upenn.edu".format(username, schools[count % len(schools)])
            count += 1
            User = get_user_model()
            if User.objects.filter(username=username).exists():
                user_objs.append(User.objects.get(username=username))
            else:
                obj = User.objects.create_user(username, email, "test")
                obj.first_name = first
                obj.last_name = last
                obj.is_staff = True
                obj.save()
                user_objs.append(obj)
        

        # create courses
        newCount = 0
        for info in courses:
            partial = dict(info)
            custom_fields = [
                "course_code",
                "queues",
            ]
            for field in custom_fields:
                if field in partial:
                    del partial[field]

            partial['semester'], _ = Semester.objects.get_or_create(year=partial['semester']['year'], term=partial['semester']['term'])

            newCourse, _ = Course.objects.get_or_create(course_code=info["course_code"], defaults=partial)
 
            professorMembership, _ = Membership.objects.get_or_create(course=newCourse, user=user_objs[newCount%len(user_objs)], kind=Membership.KIND_PROFESSOR)
            newCount += 1

            headTAList = []
            for i in range(2):
                headTAMembership, _ = Membership.objects.get_or_create(course=newCourse, user=user_objs[(newCount)%len(user_objs)], kind=Membership.KIND_HEAD_TA)
                headTAList.append(headTAMembership)
                newCount += 1

            regularTAList = []
            for i in range(2):
                regularTAMembership, _ = Membership.objects.get_or_create(course=newCourse, user=user_objs[(newCount)%len(user_objs)], kind=Membership.KIND_TA)
                regularTAList.append(regularTAMembership)
                newCount += 1

            totalTAList = headTAList + regularTAList

            studentList = []
            for i in range (4):
                studentMembership, _ = Membership.objects.get_or_create(course=newCourse, user=user_objs[(newCount)%len(user_objs)], kind=Membership.KIND_STUDENT)
                studentList.append(studentMembership)
                newCount += 1
            
            for q in info['queues']:
                newQueue, _ = Queue.objects.get_or_create(name=q['name'], description=q['description'], course=newCourse, archived=q['archived'],
                                                        estimated_wait_time=q['estimated_wait_time'], active=q['active'])
                
                respondedToCount = 0
                askedByCount = 0
                for ques in q['questions']:
                    
                    newQuestion, _ = Question.objects.get_or_create(text=ques['text'], queue=newQueue, video_chat_url=ques['video_chat_url'], status=ques['status'], 
                                                                    time_asked=ques['time_asked'], asked_by=studentList[askedByCount%len(studentList)].user, 
                                                                    should_send_up_soon_notification=ques['should_send_up_soon_notification'])

                    askedByCount += 1

                    if ques['status'] in [Question.STATUS_REJECTED, Question.STATUS_ANSWERED, Question.STATUS_ACTIVE]:
                        newQuestion.time_response_started = ques['time_response_started']
                        newQuestion.responded_to_by = totalTAList[respondedToCount%len(totalTAList)].user
                        respondedToCount += 1

                    if ques['status'] == Question.STATUS_REJECTED:
                        newQuestion.rejected_reason = ques['rejected_reason']

                    if ques['status'] in [Question.STATUS_ANSWERED, Question.STATUS_REJECTED]:
                        newQuestion.time_responsded_to = ques['time_responded_to']

                    newQuestion.save()



