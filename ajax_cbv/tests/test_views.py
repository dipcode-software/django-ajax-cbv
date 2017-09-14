from __future__ import unicode_literals

from ajax_cbv.views import DeleteAjaxView
from django.test import RequestFactory, SimpleTestCase
from mock import Mock, patch


class DeleteAjaxViewTest(SimpleTestCase):
    """docstring for ClassName"""

    def setUp(self):
        # Every test needs access to the request factory.
        self.factory = RequestFactory()

    @patch.object(DeleteAjaxView, 'get_object', return_value=Mock())
    def test_delete(self, mget_object):
        request = self.factory.delete('/unit/')
        response = DeleteAjaxView.as_view()(request)
        mget_object().delete.assert_called_with()
        self.assertEqual(response.status_code, 200)
