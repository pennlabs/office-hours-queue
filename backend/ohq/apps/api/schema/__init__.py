import graphene
from graphene import relay
from graphql_relay.node.node import from_global_id
from graphene_django.filter import DjangoFilterConnectionField

from ohq.apps.api.schema import account, courses, queues, feedback_questions, questions, types
from ohq.apps.api.models import Course, CourseUser, Question, User
from ohq.apps.api.util.errors import user_not_in_course_error


class Query(graphene.ObjectType):

    current_user = graphene.Field(types.UserNode)

    def resolve_current_user(self, info):
        return info.context.user.get_user()

    # User search for invitation
    invitable_users = DjangoFilterConnectionField(types.UserMetaNode)

    def resolve_invitable_users(self, info, **kwargs):
        return User.objects.filter(searchable=True, **kwargs)

    # TODO remove
    course = relay.Node.Field(types.CourseNode)

    course_pretty = graphene.Field(
        types.CourseNode,
        course_pretty_id=graphene.String(required=True),
    )

    def resolve_course_pretty(self, info, course_pretty_id):
        course = Course.objects.get(pretty_id=course_pretty_id)
        if not CourseUser.objects.filter(
                user=info.context.user.get_user(),
                course=course,
        ).exists():
            raise user_not_in_course_error
        return course

    current_question = graphene.Field(types.QuestionNode, course_id=graphene.ID(required=True))

    def resolve_current_question(self, info, course_id):
        user = info.context.user.get_user()
        course = Course.objects.get(pk=from_global_id(course_id)[1])
        return Question.objects.filter(
            asked_by=user,
            queue__course=course
        ).order_by('-time_asked')[:1].get()


    # Course search for students joining
    joinable_courses = DjangoFilterConnectionField(types.CourseMetaNode)

    def resolve_joinable_courses(self, info, **kwargs):
        course_ids = (
            CourseUser.objects
                .filter(user=info.context.user.get_user())
                .values_list('course_id', flat=True)
        )
        return Course.objects.exclude(id__in=course_ids).filter(
            invite_only=False,
            archived=False,
            **kwargs
        )

    queue = relay.Node.Field(types.QueueNode)


class Mutation(graphene.ObjectType):
    create_user = account.CreateUser.Field()
    update_user = account.UpdateUser.Field()

    create_course = courses.CreateCourse.Field()
    update_course = courses.UpdateCourse.Field()

    create_queue = queues.CreateQueue.Field()
    update_queue = queues.UpdateQueue.Field()
    manually_activate_queue = queues.ManuallyActivateQueue.Field()
    manually_deactivate_queue = queues.ManuallyDeactivateQueue.Field()

    create_short_answer_feedback_question = (
        feedback_questions.CreateShortAnswerFeedbackQuestion.Field()
    )
    create_radio_button_feedback_question = (
        feedback_questions.CreateRadioButtonFeedbackQuestion.Field()
    )
    create_slider_feedback_question = (
        feedback_questions.CreateSliderFeedbackQuestion.Field()
    )
    update_feedback_question = feedback_questions.UpdateFeedbackQuestion.Field()
    answer_feedback_questions = feedback_questions.AnswerFeedbackQuestions.Field()

    create_question = questions.CreateQuestion.Field()
    update_question = questions.UpdateQuestion.Field()
    withdraw_question = questions.WithdrawQuestion.Field()
    reject_question = questions.RejectQuestion.Field()
    start_question = questions.StartQuestion.Field()
    undo_start_question = questions.UndoStartQuestion.Field()
    finish_question = questions.FinishQuestion.Field()

    # add_user_to_course = courses.AddUserToCourse.Field()
    remove_user_from_course = courses.RemoveUserFromCourse.Field()
    remove_invited_user_from_course = courses.RemoveInvitedUserFromCourse.Field()
    join_courses = courses.JoinCourses.Field()
    invite_or_add_emails = courses.InviteOrAddEmails.Field()
    resend_invite_email = courses.ResendInviteEmail.Field()
    change_course_user_kind = courses.ChangeCourseUserKind.Field()
