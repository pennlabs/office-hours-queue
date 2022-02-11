from django.core.management.base import BaseCommand, CommandError
from django.core import serializers
import inspect
from ohq.invite import parse_and_send_invites
import ohq.models
import json


def dumpClass(cls, cls_name):
    file = open(cls_name +'.csv', 'w+')

    if inspect.isclass(cls):
        try :
            field_names = [field.name for field in cls._meta.get_fields()]

            for i, name in enumerate(field_names):
                if name == 'id':
                    field_names[i] = 'pk'

            while(field_names[0] != 'pk'):
                field_names.pop(0)

            file.write(str(field_names)[1:-1] + "\n")

            all_objs = cls.objects.all()
            for obj in all_objs: 
                obj_placeholder = serializers.serialize('json', [obj, ])
                obj_parsed = json.loads(obj_placeholder)[0]
                obj_placeholder = []

                for field_name in field_names:
                    if field_name in obj_parsed:
                        obj_placeholder.append(obj_parsed[field_name])
                    elif field_name in obj_parsed['fields']:
                        obj_placeholder.append(obj_parsed['fields'][field_name])
                    else:
                        obj_placeholder.append(None)
            
                try:
                    file.write(json.dumps(obj_placeholder)[1:-1] + "\n")
                    
                except Exception:
                    print('error writing object', cls_name)

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
                if (name[0:2] != '__') and (name != 'User') and (name[0].isupper()):
                    print("whent here")
                    dumpClass(cls, name)
            file.close()
        else:
            # Usage: dbdump --class Course Semester Announcements ... 
            
            for (name, cls) in inspect.getmembers(ohq.models):
                if name in kwargs['class']:
                    dumpClass(cls, name, file)