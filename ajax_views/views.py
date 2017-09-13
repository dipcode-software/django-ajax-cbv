# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

from .mixins import PartialAjaxMixin, FormAjaxMixin, AjaxResponseMixin

from django.views.generic import (
    TemplateView, CreateView, UpdateView, DeleteView)



class TemplateAjaxView(PartialAjaxMixin, TemplateView):
    """ """


class CreateAjaxView(FormAjaxMixin, PartialAjaxMixin, CreateView):
    """ """


class UpdateAjaxView(FormAjaxMixin, PartialAjaxMixin, UpdateView):
    """ """


class DeleteAjaxView(PartialAjaxMixin, AjaxResponseMixin, DeleteView):
    """ """

    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        self.object.delete()
        return self.json_to_response()
