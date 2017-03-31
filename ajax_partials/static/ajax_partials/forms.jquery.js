/* globals jQuery */

/******************************************************************
 * Author: Dipcode
 *
 * Django forms ajax submission
 * Example:
 *   <form data-ajax-submit>
 *****************************************************************/

"use strict";

(function($) {

    function CacheFile(name, filename, file) {
        this.name = name;
        this.filename = filename;
        this.file = new Blob([file]);
    }

    function ManageCacheFile($form) {
        this.$form = $form;
        this.$inputFiles = this.$form.find("input[type='file']");
        this.cachedFiles = {};
        this.bindEvents();
    }

    ManageCacheFile.prototype = {

        getFormData: function getFormData()
        {
            this.$inputFiles.prop('disabled', true);

            var data = new FormData(this.$form.get(0));

            for (var i in this.cachedFiles) {
                var cachedFile = this.cachedFiles[i];
                data.append(cachedFile.name, cachedFile.file, cachedFile.filename);
            }

            this.$inputFiles.prop('disabled', false);

            return data;
        },

        bindEvents: function bindEvents()
        {
            var self = this;

            this.$form.find("input[type='file']").on('change', function(e)
            {
                var name = $(this).attr('name'),
                    file = e.target.files[0],
                    reader = new FileReader();

                if (file !== undefined) {
                    reader.onload = function(evt) {
                        self.cachedFiles[name] = new CacheFile(name, file.name, evt.target.result);
                    };

                    reader.readAsBinaryString(file);
                }
                else if (name in self.cachedFiles) {
                    delete self.cachedFiles[name];
                }
            });
        }
    };


    $.fn.djangoAjaxForms = function(options)
    {
        var opts = $.extend({
            fieldIdSelector: "field_id_",
            fieldErrorClass: "errorlist",
            errorClass: "error",
            cacheFilesAttr: "[data-ajax-submit-cachefiles]",
            canSubmitFn: null,
            onFailFn: null,
            onFieldErrorFn: null,
            onNonFieldErrorFn: null,
            onRenderErrorFn: null,
            onSubmit: null,
            onSubmitDone: null,
            onBeforeSubmit: null,
            onSubmitSuccess: null
        }, $.fn.djangoAjaxForms.defaults, options);


        function DjangoAjaxForms($form)
        {
            var self = this,
                canSubmit = true;

            this.$form = $form;
            this.$form.on('submit', function(e) {
                e.preventDefault();

                if ( $.isFunction( opts.canSubmitFn ) ) {
                    canSubmit = opts.canSubmitFn(self.$form);
                }

                if (self.$form.length > 0 && canSubmit) {
                    self.submit();
                }
            });

            if (this.$form.filter(opts.cacheFilesAttr).length) {
                this.cachedFiles = new ManageCacheFile(this.$form);
            }
        }

        DjangoAjaxForms.prototype = {

            request: function request(url, data)
            {
                return $.ajax(url, {
                    data: data,
                    method: 'POST',
                    contentType: false,
                    processData: false,
                    dataType: 'json'
                });
            },

            submit: function submit()
            {
                var self = this;

                if ( $.isFunction( opts.onBeforeSubmit ) ) {
                    opts.onBeforeSubmit(this.$form);
                }

                var url = this.$form.attr("action") || window.location.href;
                var data = new FormData(this.$form.get(0));
                var disabled_fields = this.$form.find(":input:disabled");

                if (this.$form.filter(opts.cacheFilesAttr).length) {
                    data = this.cachedFiles.getFormData();
                }

                this.$form.find(':input').prop('disabled', true);

                if ( $.isFunction( opts.onSubmit ) ) {
                    opts.onSubmit(this.$form);
                }

                return this.request(url, data)

                .done(function(response) {
                    self.processFormErrors(self.$form, response.errors_list);

                    if (!$.isEmptyObject(response.errors_list)) {

                        if ( $.isFunction( opts.onFieldErrorFn ) ) {
                            opts.onFieldErrorFn(self.$form);
                        }
                        self.$form.find(':input').not(disabled_fields).prop('disabled', false);
                    }
                    else {
                        if ( $.isFunction( opts.onSubmitSuccess ) ) {
                            opts.onSubmitSuccess(self.$form);
                        }
                        self.$form.trigger('form:submit:success');
                    }
                    if( response.action){
                        self.processResponse(response.action, response.action_url);
                    }
                })

                .fail(function () {
                    self.$form.find(':input').not(disabled_fields).prop('disabled', false);

                    if ( $.isFunction( opts.onFailFn ) ) {
                        opts.onFailFn();
                    }
                })

                .always(function() {
                    if ( $.isFunction( opts.onSubmitDone ) ) {
                        opts.onSubmitDone(self.$form);
                    }
                });
            },

            processFormErrors: function processFormErrors($form, errors_list)
            {
                var $wrappers = $form.find("[id^='" + opts.fieldIdSelector + "']");

                $wrappers.removeClass(opts.errorClass).find("." + opts.fieldErrorClass).remove();

                for (var fieldName in errors_list) {
                    var errors = errors_list[fieldName];

                    var $field = $form.find("#" + opts.fieldIdSelector + fieldName);
                    var onChange = function () {
                        $field.removeClass('error', 200).find('.errorlist').fadeOut(200, function () {
                            $(this).remove();
                        });
                    };

                    $field.addClass(opts.errorClass).append(this.renderErrorList(errors));
                    $field.one('change', onChange);
                }
            },

            processResponse: function processResponse(action, value)
            {
                switch (action) {
                    case 'refresh':
                        window.location.reload(true);
                        break;
                    case 'redirect':
                        window.location.href = value;
                        break;
                    default:
                        return;
                }
            },

            renderErrorList: function renderErrorList(errorsList)
            {
                var $elem = $("<ul>").addClass(opts.fieldErrorClass);

                for (var field in errorsList) {
                    $elem.append($("<li>").text(errorsList[field]));
                }

                if ( $.isFunction( opts.onRenderErrorFn ) ) {
                    $elem = opts.onRenderErrorFn( $elem, errorsList );
                }

                return $elem;
            }
        };

        return this.each(function()
        {
            new DjangoAjaxForms($(this));
        });
    };

    $.fn.djangoAjaxForms.defaults = {};

})(jQuery);
