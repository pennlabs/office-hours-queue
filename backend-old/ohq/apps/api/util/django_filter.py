from graphene.types.utils import get_type
from graphene.types.field import Field
from graphene.types.structures import List
from graphene_django.filter.utils import get_filtering_args_from_filterset, get_filterset_class
from functools import partial

class DjangoFilterField(Field):
    '''
    Custom field to use django-filter with graphene object types (without relay).
    '''

    def __init__(
        self,
        type,
        fields=None,
        extra_filter_meta=None,
        filterset_class=None,
        *args,
        **kwargs,
    ):
        # _type = get_type(type)
        # _fields = _type._meta.filter_fields
        # _model = _type._meta.model
        self._of_type = type
        self._fields = fields # or _fields
        self._provided_filterset_class = filterset_class
        self._filterset_class = None
        self._extra_filter_meta = extra_filter_meta

        # meta = dict(model=_model, fields=self._fields)
        # if extra_filter_meta:
        #     meta.update(extra_filter_meta)
        # self.filterset_class = get_filterset_class(filterset_class, **meta)
        # self.filtering_args = get_filtering_args_from_filterset(
        #     self.filterset_class, _type)
        kwargs.setdefault('args', {})
        kwargs['args'].update(self.filtering_args)
        _type = lambda: List(self.of_type)
        super(DjangoFilterField, self).__init__(_type, *args, **kwargs)

    @property
    def of_type(self):
        return get_type(self._of_type)

    @property
    def filterset_class(self):
        if not self._filterset_class:
            fields = self._fields or self.of_type._meta.filter_fields
            meta = dict(model=self.of_type._meta.model, fields=fields)
            if self._extra_filter_meta:
                meta.update(self._extra_filter_meta)

            filterset_class = self._provided_filterset_class or (
                self.of_type._meta.filterset_class
            )
            self._filterset_class = get_filterset_class(filterset_class, **meta)

        return self._filterset_class

    @property
    def filtering_args(self):
        return get_filtering_args_from_filterset(self.filterset_class, None)

    @staticmethod
    def list_resolver(manager, filterset_class, filtering_args, root, info, *args, **kwargs):
        filter_kwargs = {k: v for k,
                         v in kwargs.items() if k in filtering_args}
        qs = manager.get_queryset()
        qs = filterset_class(data=filter_kwargs, queryset=qs).qs
        return qs

    def get_resolver(self, parent_resolver):
        return partial(self.list_resolver, self.of_type._meta.model._default_manager,
                       self.filterset_class, self.filtering_args)


