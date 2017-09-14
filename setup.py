# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import io
import os
from shutil import rmtree
import sys

from setuptools import Command, find_packages, setup


# Package meta-data.
VERSION = __import__("ajax_cbv").__version__
NAME = 'django-ajax-cbv'
DESCRIPTION = 'Django module to easily use generic views with ajax. '
URL = 'https://github.com/dipcode-software/django-ajax-cbv/'
EMAIL = 'team@dipcode.com'
AUTHOR = 'Dipcode'


here = os.path.abspath(os.path.dirname(__file__))
with io.open(os.path.join(here, 'README.rst'), encoding='utf-8') as f:
    long_description = '\n' + f.read()


class PublishCommand(Command):
    """Support setup.py publish."""

    description = 'Build and publish the package.'
    user_options = []
    environment = None

    @staticmethod
    def status(s):
        """Prints things in bold."""
        print('\033[1m{0}\033[0m'.format(s))

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        try:
            self.status('Removing previous builds…')
            rmtree(os.path.join(here, 'dist'))
            rmtree(os.path.join(here, 'build'))
        except OSError:
            pass

        self.status('Building Source and Wheel distribution…')
        os.system(
            '{0} setup.py sdist bdist_wheel '.format(sys.executable)
        )

        self.status('Uploading the package to {env} via Twine…'\
            .format(env=self.environment))
        os.system('twine upload --repository {env} dist/*'.format(env=self.environment))

        sys.exit()


class ProductionPublishCommand(PublishCommand):
    environment = 'pypi'


class DevelopmentPublishCommand(PublishCommand):
    environment = 'testpypi'


setup(
    name=NAME,
    version=VERSION,
    description=DESCRIPTION,
    long_description=long_description,
    author=AUTHOR,
    author_email=EMAIL,
    url=URL,
    packages=find_packages(),
    include_package_data=True,
    license='MIT',
    classifiers=[
        'Environment :: Web Environment',
        'Framework :: Django',
        'Framework :: Django :: 1.11',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.7',
    ],
    cmdclass={
        'publish_dev': DevelopmentPublishCommand,
        'publish_prod': ProductionPublishCommand,
    },
)
