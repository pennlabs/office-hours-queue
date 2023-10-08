from django.db.models import Q
from django_filters import rest_framework as filters

from ohq.models import CourseStatistic, Question, QueueStatistic


class QuestionSearchFilter(filters.FilterSet):
    # time_asked = filters.DateFilter(lookup_expr="icontains")
    search = filters.CharFilter(method="search_filter")
    order_by = filters.OrderingFilter(fields=["time_asked", "time_responded_to"])

    class Meta:
        model = Question
        fields = {"time_asked": ["gt", "lt"], "queue": ["exact"], "status": ["exact"], "time_responded_to": ["gt", "lt"]}

    def search_filter(self, queryset, name, value):
        return queryset.filter(
            Q(text__icontains=value)
            | Q(asked_by__first_name__icontains=value)
            | Q(asked_by__last_name__icontains=value)
            | Q(responded_to_by__first_name__icontains=value)
            | Q(responded_to_by__last_name__icontains=value)
        )


class CourseStatisticFilter(filters.FilterSet):
    class Meta:
        model = CourseStatistic
        fields = ["metric", "date"]


class QueueStatisticFilter(filters.FilterSet):
    class Meta:
        model = QueueStatistic
        fields = {"metric": ["exact"], "date": ["gt", "lt", "gte", "lte", "exact"]}
