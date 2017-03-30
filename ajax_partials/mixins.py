from __future__ import unicode_literals

from django.template.loader import render_to_string
from django.http import JsonResponse

from .utils import add_errors_prefix_form


class AjaxResponseAction():
    """ Represents list of actions available after ajax response """

    NOTHING = "nothing"
    REDIRECT = "redirect"
    REFRESH = "refresh"

    choices = (
        NOTHING,
        REDIRECT,
        REFRESH
    )


class AjaxResponseMixin(object):
    """ Mixin responsible to give the JSON response """
    action = AjaxResponseAction.NOTHING

    def json_to_response(self, action=None, success_url=None):
        """ Valid response with next action to be followed by the JS """
        self.action = action or self.get_action()
        if self.action not in AjaxResponseAction.choices:
            raise ValueError(
                "Invalid action selected: '{}'".format(self.action))
        data = {
            "action": self.action,
        }
        if self.action == AjaxResponseAction.REDIRECT:
            data["action_url"] = success_url or self.get_success_url()
        return JsonResponse(data)

    def get_action(self):
        """ Returns action to take after call """
        return self.action


class FormAjaxMixin(AjaxResponseMixin):
    """ Mixin responsible to take care of form ajax submission """

    def form_invalid(self, form, prefix=None):
        """ If form invalid return error list in JSON response """
        response = super(FormAjaxMixin, self).form_invalid(form)
        if self.request.is_ajax():
            data = {
                "errors_list": self.add_prefix(form.errors, prefix),
            }
            return JsonResponse(data, status=400)
        else:
            return response

    def form_valid(self, form):
        """ If form valid return response with action """
        response = super(AjaxResponseMixin, self).form_valid(form)
        if self.request.is_ajax():
            return self.json_to_response()
        else:
            return response

    def add_prefix(self, errors, prefix):
        """Add form prefix to errors"""
        if not prefix:
            prefix = self.get_prefix()
        if prefix:
            return add_errors_prefix_form(errors, prefix)
        return errors


class PartialAjaxMixin(object):
    """ Mixin responsible to return the JSON with template rendered """

    def render_to_response(self, context, **response_kwargs):
        """ Returns the rendered template in JSON format """
        context = self.get_context_data()
        data = {
            "content": render_to_string(self.template_name, context,
                                        request=self.request)
        }
        return JsonResponse(data)
