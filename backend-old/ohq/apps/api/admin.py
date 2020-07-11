from django.contrib import admin
from polymorphic.admin import PolymorphicParentModelAdmin, PolymorphicChildModelAdmin

from .models import *

admin.site.register(AuthUser)
admin.site.register(User)
admin.site.register(Course)
admin.site.register(CourseUser)
admin.site.register(InvitedCourseUser)
admin.site.register(Queue)
admin.site.register(Question)


@admin.register(ShortAnswerFeedbackQuestion)
class ShortAnswerFeedbackQuestionChildAdmin(PolymorphicChildModelAdmin):
    base_model = ShortAnswerFeedbackQuestion

    def get_readonly_fields(self, request, obj=None):
        return () if obj is None else ('question_text',)


@admin.register(RadioButtonFeedbackQuestion)
class RadioButtonFeedbackQuestionChildAdmin(PolymorphicChildModelAdmin):
    base_model = RadioButtonFeedbackQuestion

    def get_readonly_fields(self, request, obj=None):
        return () if obj is None else ('question_text', 'answer_choices',)


@admin.register(SliderFeedbackQuestion)
class SliderFeedbackQuestionChildAdmin(PolymorphicChildModelAdmin):
    base_model = SliderFeedbackQuestion

    def get_readonly_fields(self, request, obj=None):
        return () if obj is None else ('question_text', 'answer_lower_bound', 'answer_upper_bound',)


@admin.register(FeedbackQuestion)
class FeedbackQuestionParentAdmin(PolymorphicParentModelAdmin):
    base_model = FeedbackQuestion
    child_models = (
        ShortAnswerFeedbackQuestion,
        RadioButtonFeedbackQuestion,
        SliderFeedbackQuestion,
    )


@admin.register(ShortAnswerFeedbackAnswer)
class ShortAnswerFeedbackAnswerChildAdmin(PolymorphicChildModelAdmin):
    base_model = ShortAnswerFeedbackAnswer


@admin.register(RadioButtonFeedbackAnswer)
class RadioButtonFeedbackAnswerChildAdmin(PolymorphicChildModelAdmin):
    base_model = RadioButtonFeedbackAnswer


@admin.register(SliderFeedbackAnswer)
class SliderFeedbackAnswerChildAdmin(PolymorphicChildModelAdmin):
    base_model = SliderFeedbackAnswer


@admin.register(FeedbackAnswer)
class FeedbackAnswerParentAdmin(PolymorphicParentModelAdmin):
    base_model = FeedbackAnswer
    child_models = (
        ShortAnswerFeedbackAnswer,
        RadioButtonFeedbackAnswer,
        SliderFeedbackAnswer,
    )
