from __future__ import unicode_literals

from django.conf import settings
from django.http import Http404, JsonResponse
from django.template.loader import render_to_string


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


class AjaxResponseStatus():
    """ Represents list of status available at ajax response """

    ERROR = "error"
    SUCCESS = "success"

    choices = (
        ERROR,
        SUCCESS,
    )


class AjaxResponseMixin(object):
    """ Mixin responsible to give the JSON response """
    action = AjaxResponseAction.NOTHING
    json_status = AjaxResponseStatus.SUCCESS

    def json_to_response(self, action=None, json_status=None, success_url=None,
                         json_data=None, **response_kwargs):
        """ Valid response with next action to be followed by the JS """
        data = {
            "status": self.get_status(json_status),
            "action": self.get_action(action),
            "extra_data": self.get_json_data(json_data or {})
        }

        if self.action == AjaxResponseAction.REDIRECT:
            data["action_url"] = success_url or self.get_success_url()
        return JsonResponse(data, **response_kwargs)

    def get_action(self, action=None):
        """ Returns action to take after call """
        if action:
            self.action = action

        if self.action not in AjaxResponseAction.choices:
            raise ValueError(
                "Invalid action selected: '{}'".format(self.action))

        return self.action

    def get_status(self, json_status=None):
        """ Returns status of for json """
        if json_status:
            self.json_status = json_status

        if self.json_status not in AjaxResponseStatus.choices:
            raise ValueError(
                "Invalid status selected: '{}'".format(self.json_status))

        return self.json_status

    def get_json_data(self, json_data=None):
        """ Returns any extra data to add to json """
        return json_data or {}


class FormAjaxMixin(AjaxResponseMixin):
    """ Mixin responsible to take care of form ajax submission """

    def form_invalid(self, form, prefix=None):
        """ If form invalid return error list in JSON response """
        response = super(FormAjaxMixin, self).form_invalid(form)
        if self.request.is_ajax():
            data = {
                "errors_list": self.add_prefix(form.errors, prefix),
            }
            return self.json_to_response(status=400, json_data=data,
                                         json_status=AjaxResponseStatus.ERROR)
        return response

    def get_success_url(self):
        """ """
        if not self.request.is_ajax():
            return super(FormAjaxMixin, self).get_success_url()
        return None

    def form_valid(self, form):
        """ If form valid return response with action """
        response = super(FormAjaxMixin, self).form_valid(form)
        if self.request.is_ajax():
            return self.json_to_response()
        return response

    def add_prefix(self, errors, prefix):
        """Add form prefix to errors"""
        if not prefix:
            prefix = self.get_prefix()
        if prefix:
            return {"%s-%s" % (prefix, k): v for k, v in errors.items()}
        return errors


class PartialAjaxMixin(object):
    """ Mixin responsible to return the JSON with template rendered """
    partial_title = None

    def get_partial_title(self):
        return self.partial_title

    def get_context_data(self, **kwargs):
        context = super(PartialAjaxMixin, self).get_context_data(**kwargs)
        partial_title = self.get_partial_title()
        if partial_title:
            context.update({
                'title': partial_title
            })
        return context

    def render_to_response(self, context, **response_kwargs):
        """ Returns the rendered template in JSON format """
        if self.request.is_ajax():
            data = {
                "content": render_to_string(
                    self.get_template_names(), context, request=self.request)
            }
            return JsonResponse(data)
        if settings.DEBUG:
            return super(PartialAjaxMixin, self).render_to_response(
                context, **response_kwargs)
        raise Http404()
