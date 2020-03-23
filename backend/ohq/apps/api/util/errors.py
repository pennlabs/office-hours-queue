from graphql import GraphQLError
from ohq.apps.api.models import Course

empty_string_error = GraphQLError("Required string input must not be empty")

email_not_upenn_error = GraphQLError("Must sign up with upenn.edu email")

course_does_not_exist_error = GraphQLError("Course does not exist")
queue_does_not_exist_error = GraphQLError("Queue does not exist")
question_does_not_exist_error = GraphQLError("Question does not exist")

user_not_student_error = GraphQLError("User is not a student")
user_not_staff_error = GraphQLError("User is not a staff member")
user_not_leadership_error = GraphQLError("User is not a leadership member")

new_user_kind_must_be_staff_error = GraphQLError("New user kind must be staff")

user_not_asker_error = GraphQLError("User is not the question asker")
user_not_answerer_error = GraphQLError("User is not the question answerer")

too_many_questions_error = GraphQLError("Too many questions already asked")
unrecognized_tag_error = GraphQLError("Tag not recognized")
question_too_long_error = GraphQLError("Question must be at most 250 characters")
video_chat_disabled_error = GraphQLError("Video chat is disabled")
video_chat_url_required_error = GraphQLError("Course requires video chat url provided")

question_not_active_error = GraphQLError("Question state is not active")
question_not_started_error = GraphQLError("Question state is not started")
question_not_answered_error = GraphQLError("Question state is not answered")

other_rejection_reason_required_error = GraphQLError("Must provide other rejection reason")

all_required_feedback_questions_not_answered_error = GraphQLError("Must answer all required "
                                                                  "feedback questions")

too_many_queues_error = GraphQLError("Too many queues already created")
queue_active_error = GraphQLError("Queue is currently active")
queue_inactive_error = GraphQLError("Queue is currently inactive")

course_invite_only_error = GraphQLError("Course is invite only")
course_archived_error = GraphQLError("Course is archived")
user_not_in_course_error = GraphQLError("User is not in course")
user_in_course_error = GraphQLError("User is already in course")
remove_only_leadership_error = GraphQLError("Cannot remove only leadership user")
max_number_users_error = GraphQLError(f"Course cannot have more than "
                                      f"{Course.MAX_NUMBER_COURSE_USERS} users")

invalid_day_of_week_error = GraphQLError("Invalid day of the week")
invalid_time_of_day_error = GraphQLError("Invalid time of day")

empty_update_error = GraphQLError("Update cannot be empty")

phone_number_not_set_error = GraphQLError("Phone number must be set")
phone_number_already_verified_error = GraphQLError("Phone number is already verified")
verification_resend_wait_error = GraphQLError("Must wait 30 seconds to resend")
verification_code_incorrect_error = GraphQLError("Verification code is incorrect")
verification_code_expired_error = GraphQLError("Verification code is expired")
