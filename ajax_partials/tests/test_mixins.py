from __future__ import unicode_literals

import json

from django.test import SimpleTestCase

from ajax_partials.mixins import AjaxResponseMixin, AjaxResponseAction


class AjaxResponseMixinTest(SimpleTestCase):

    class OkObject(AjaxResponseMixin):
        """ """

    def setUp(self):
        self.object = self.OkObject()

    def test_response_no_action(self):
        response = self.object.json_to_response()
        content = json.loads(response.content)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(content['action'], "nothing")

    def test_response_with_action_refresh(self):
        response = self.object.json_to_response(
            action=AjaxResponseAction.REFRESH)
        content = json.loads(response.content)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(content['action'], "refresh")

    def test_response_with_action_redirect(self):
        response = self.object.json_to_response(
            action=AjaxResponseAction.REDIRECT,
            success_url="/unit/test")
        content = json.loads(response.content)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(content['action'], "redirect")
        self.assertEqual(content['action_url'], "/unit/test")

    def test_get_action(self):
        self.assertEqual(self.object.get_action(), AjaxResponseAction.NOTHING)
