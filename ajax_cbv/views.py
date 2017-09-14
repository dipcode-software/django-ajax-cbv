# -*- coding: utf-8 -*-
from __future__ import absolute_import, unicode_literals

from django.views.generic import (
    CreateView, DeleteView, TemplateView, UpdateView)

from .mixins import AjaxResponseMixin, FormAjaxMixin, PartialAjaxMixin


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
