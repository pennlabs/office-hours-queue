from rest_framework.pagination import PageNumberPagination


class QuestionSearchPagination(PageNumberPagination):
    """
    Custom pagination for QuestionListView.
    """

    page_size = 20
