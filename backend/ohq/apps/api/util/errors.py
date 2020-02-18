from graphql import GraphQLError

course_does_not_exist_error = GraphQLError("Course does not exist")
queue_does_not_exist_error = GraphQLError("Queue does not exist")
question_does_not_exist_error = GraphQLError("Question does not exist")

user_not_student_error = GraphQLError("User is not a student")
user_not_staff_error = GraphQLError("User is not a staff member")
user_not_leadership_error = GraphQLError("User is not a leadership member")

user_not_asker_error = GraphQLError("User is not the question asker")
user_not_answerer_error = GraphQLError("User is not the question answerer")

too_many_questions_error = GraphQLError("Too many questions already asked")
unrecognized_tag_error = GraphQLError("Tag not recognized")

question_not_active_error = GraphQLError("Question state is not active")
question_not_started_error = GraphQLError("Question state is not started")
question_not_answered_error = GraphQLError("Question state is not answered")

other_rejection_reason_required_error = GraphQLError("Must provide other rejection reason")

all_required_feedback_questions_not_answered_error = GraphQLError("Must answer all required "
                                                                  "feedback questions")
too_many_queues_error = GraphQLError("Too many queues already created")

invalid_day_of_week_error = GraphQLError("Invalid day of the week")
invalid_time_of_day_error = GraphQLError("Invalid time of day")

course_invite_only_error = GraphQLError("Course is invite only")
user_in_course_error = GraphQLError("User is already in course")
remove_only_leadership_error = GraphQLError("Cannot remove only leadership user")

empty_update_error = GraphQLError("Update cannot be empty")
