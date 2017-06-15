# /usr/bin/python
import django
import sys

from django.test.runner import DiscoverRunner
from django.conf import settings

settings.configure(
    INSTALLED_APPS=(
        'ajax_views',
    ),
)

if __name__ == "__main__":
    django.setup()
    runner = DiscoverRunner()
    failures = runner.run_tests(['ajax_views'])
    if failures:
        sys.exit(failures)
