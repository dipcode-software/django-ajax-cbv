def add_errors_prefix_form(errors, prefix):
    return {"%s-%s" % (prefix, k): v for k, v in errors.items()}
