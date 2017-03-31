import os
from setuptools import find_packages, setup

with open(os.path.join(os.path.dirname(__file__), 'README.md')) as readme:
    README = readme.read()

os.chdir(os.path.normpath(os.path.join(os.path.abspath(__file__), os.pardir)))

setup(
    name='django-ajax-partials',
    version='0.1.0-alpha',
    packages=find_packages(),
    include_package_data=True,
    license='MIT',
    description='Django module to easily use ajax forms.',
    long_description=README,
    url='https://github.com/dipcode-software/django-ajax-partials/',
    author='Dipcode',
    author_email='info@dipcode.com',
    classifiers=[
        'Environment :: Web Environment',
        'Framework :: Django',
        'Framework :: Django :: 1.10',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.7',
    ],
)
