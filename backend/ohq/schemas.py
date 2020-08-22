from rest_framework.schemas.openapi import AutoSchema


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
