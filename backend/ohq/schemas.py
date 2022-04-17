from rest_framework.schemas.openapi import AutoSchema
import coreapi

class MassInviteSchema(AutoSchema):
    def get_operation(self, path, method):
        operation = super().get_operation("/", method)
        operation["requestBody"] = {
            "content": {
                "application/json": {
                    "schema": {
                        "properties": {
                            "emails": {"type": "string"},
                            "kind": {"enum": ["STUDENT", "TA", "HEAD_TA", "PROFESSOR"]},
                        }
                    }
                }
            }
        }
        operation["parameters"] = [
            {"name": "course_pk", "required": True, "in": "path", "schema": {"type": "string"}}
        ]
        operation["responses"] = {
            "200": {
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "detail": {"type": "string"},
                                "members_added": {"type": "integer"},
                                "invites_sent": {"type": "integer"},
                            },
                        }
                    }
                }
            }
        }
        return operation

class QuestionSchema(AutoSchema):
    
    def get_operation(self, path, method):
        op = super().get_operation(path, method)
        
        if op['operationId'] == 'updateQuestion':
            op['requestBody'] = {
                "content": {
                    "multipart-form/data": {
                        "schema": {
                            "properties": {
                                "files": {"type": "files"},
                                "text": {"required": True, "type": "string"},
                                "videoChatUrl": {"type": "string"},
                                "status": {"type": "string", "description": "Enum: 'ASKED', 'WITHDRAWN', 'ACTIVE', 'REJECTED', 'ANSWERED'"},
                                "rejectedReason": {"type": "string or null", "descriptioN": "<= 255 characters"},
                                "tags": {"type": "Array of objects"},
                                "note": {"type": "string or null"},
                                "studentDescriptor": {"type": "string or null"}
                            }
                        }
                    }
                }
        }
        return op

    # def get_manual_fields(self, path, method):
    #     print('getting manual fields')
    #     manual_fields = super().get_manual_fields(path, method)
    #     custom_fields = []
    #     if method.lower() == 'post':
    #         print('post')
    #         custom_fields =[
    #             coreapi.Field("file", 
    #             required=False, 
    #             location="form",
    #             description="file")
    #         ]

    #     if method.lower() == 'put':
    #         print('put')
        
    #     print(manual_fields + custom_fields)
    #     return manual_fields + custom_fields

class EventSchema(AutoSchema):
    def get_operation(self, path, method):
        op = super().get_operation(path, method)
        if op["operationId"] == "listEvents":
            op["parameters"].append(
                {
                    "name": "course",
                    "in": "query",
                    "required": True,
                    "description": "A series of api/events/?course=1&course=2 "
                    + "- where the numbers are the course pks",
                    "schema": {"type": "string"},
                }
            )
        return op


class OccurrenceSchema(AutoSchema):
    def get_operation(self, path, method):
        op = super().get_operation(path, method)
        if op["operationId"] == "listOccurrences":
            op["parameters"].append(
                {
                    "name": "course",
                    "in": "query",
                    "required": True,
                    "description": "A series of api/occurrences/?course=1&course=2 "
                    + "- where the numbers are the course pks",
                    "schema": {"type": "string"},
                }
            )
            op["parameters"].append(
                {
                    "name": "filter_start",
                    "in": "query",
                    "required": True,
                    "description": "The start date of the filter in ISO format in UTC+0.<br>"
                    + "The returned events will have start_time strictly within "
                    + "the range of the filter<br>"
                    + "e.g 2021-10-05T12:41:37Z",
                    "schema": {"type": "datetime"},
                }
            )
            op["parameters"].append(
                {
                    "name": "filter_end",
                    "in": "query",
                    "required": True,
                    "description": "The end date of the filter in ISO format in UTC+0<br>"
                    + "e.g 2021-10-05T12:41:37Z",
                    "schema": {"type": "datetime"},
                }
            )
        return op
