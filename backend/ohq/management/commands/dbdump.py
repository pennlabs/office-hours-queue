from django.core.management.base import BaseCommand, CommandError
from django.core import serializers
import inspect
from ohq.invite import parse_and_send_invites
import ohq.models


def dumpClass(cls, cls_name, file):
    if inspect.isclass(cls):
        try :
            all_objs = cls.objects.all()
            for obj in all_objs: 
                serialized_obj = serializers.serialize('json', [obj, ])
                try:
                    file.write(serialized_obj +"\n")
                except Exception:
                    print('error writing object', serialized_obj)

        except Exception:
            print('error getting objects: ', cls_name)

class Command(BaseCommand):
    help = "Creates a course with default settings and invites users to course"

    def add_arguments(self, parser):
        parser.add_argument("--class", nargs="*", help="name of the classes that you want to download")
        

    def handle(self, *args, **kwargs):
        file = open('dbdump.txt', 'w+')

        if (kwargs['class'] is None):
            # dump every class
            for (name, cls) in inspect.getmembers(ohq.models):
                dumpClass(cls, name, file)
            file.close()
        else:
            # Usage: dbdump --class Course Semester Announcements ... 
            for (name, cls) in inspect.getmembers(ohq.models):
                if name in kwargs['class']:
                    dumpClass(cls, name, file)