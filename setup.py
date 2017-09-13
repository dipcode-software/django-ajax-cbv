from setuptools import find_packages, setup


setup(
    name='django-ajax-partials',
    version=__import__("ajax_views").__version__,
    packages=find_packages(),
    include_package_data=True,
    license='MIT',
    description='Django module to easily use generic views with ajax.',
    url='https://github.com/dipcode-software/django-ajax-partials/',
    author='Dipcode',
    author_email='team@dipcode.com',
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
