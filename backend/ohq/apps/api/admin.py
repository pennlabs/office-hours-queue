from django.contrib import admin
from polymorphic.admin import PolymorphicParentModelAdmin, PolymorphicChildModelAdmin

from .models import *

admin.site.register(User)
admin.site.register(Course)
admin.site.register(CourseUser)
admin.site.register(Queue)
admin.site.register(Question)
# admin.site.register(FeedbackQuestion)
# admin.site.register(FeedbackAnswer)


@admin.register(ShortAnswerFeedbackQuestion)
class ShortAnswerFeedbackQuestionChildAdmin(PolymorphicChildModelAdmin):
    base_model = ShortAnswerFeedbackQuestion


@admin.register(RadioButtonFeedbackQuestion)
class RadioButtonFeedbackQuestionChildAdmin(PolymorphicChildModelAdmin):
    base_model = RadioButtonFeedbackQuestion


@admin.register(SliderFeedbackQuestion)
class SliderFeedbackQuestionChildAdmin(PolymorphicChildModelAdmin):
    base_model = SliderFeedbackQuestion


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
