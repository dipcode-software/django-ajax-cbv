/* globals jQuery */

/******************************************************************
 * Author: Dipcode
 *
 * Django forms ajax submission
 * Example:
 *   <form data-ajax-submit>
 *****************************************************************/



(function($) {
    "use strict";

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

    var methods = {
        submit: function (data) {
            var daf = this.data('daf-data');
            if (daf) {
                daf.submit(data);
            }
        }
    };

    $.fn.djangoAjaxForms = function(options)
    {
        var opts = $.extend({
            fieldIdSelector: "div_id_",
            fieldErrorClass: "form-control-feedback",
            errorClass: "has-danger",
            cacheFilesAttr: "[data-ajax-submit-cachefiles]",
            canSubmitFn: null,
            onRenderErrorFn: null,
            handleSubmitEvent: true,
        }, $.fn.djangoAjaxForms.defaults, options);

        function DjangoAjaxForms($form)
        {
            this.$form = $form;
            this.$form.data('daf-data', this);

            if (opts.handleSubmitEvent) {
                var self = this,
                    canSubmit = true;

                this.$form.on('submit', function(e) {
                    e.preventDefault();

                    if ( $.isFunction( opts.canSubmitFn ) ) {
                        canSubmit = opts.canSubmitFn(self.$form);
                    }

                    if (self.$form.length > 0 && canSubmit) {
                        self.submit();
                    }
                });
            }

            if (this.$form.filter(opts.cacheFilesAttr).length) {
                this.cachedFiles = new ManageCacheFile(this.$form);
            }
        }

        DjangoAjaxForms.prototype = {

            request: function request(url, data, isCustomData)
            {
                var options = {
                    data: data,
                    method: 'POST',
                    dataType: 'json'
                };

                if ( !isCustomData ) {
                    options.contentType = false;
                    options.processData = false;
                }

                return $.ajax(url, options);
            },

            submit: function submit(customData)
            {
                var self = this;

                this.$form.trigger("ajaxforms:beforesubmit");

                var url = this.$form.attr("action") || window.location.href;
                var disabled_fields = this.$form.find(":input:disabled");
                var data = customData;
                var isCustomData = true;

                if (customData === undefined) {
                    data = new FormData(this.$form.get(0));
                    isCustomData = false;
                }

                if (this.$form.filter(opts.cacheFilesAttr).length) {
                    data = this.cachedFiles.getFormData();
                }

                this.$form.find(':input').prop('disabled', true);
                this.$form.trigger("ajaxforms:submit");

                return this.request(url, data, isCustomData)

                    .done(function(response) {
                        self.$form.trigger("ajaxforms:submitsuccess");
                        self.$form.trigger('form:submit:success');

                        if( response.action ){
                            self.processResponse(response.action, response.action_url);
                        }
                    })

                    .fail(function ($xhr) {
                        var response = $xhr.responseJSON;

                        if (response && response.hasOwnProperty('extra_data')) {
                            var errors_list = response.extra_data.errors_list;

                            self.processFormErrors(self.$form, errors_list);
                        } else {
                            self.$form.trigger("ajaxforms:fail");
                        }

                        self.$form.find(':input').not(disabled_fields).prop('disabled', false);
                    })

                    .always(function() {
                        self.$form.trigger("ajaxforms:submitdone");
                    });
            },

            processFormErrors: function processFormErrors($form, errors_list)
            {
                var $wrappers = $form.find("[id^='" + opts.fieldIdSelector + "']");
                var nonfielderror = false;

                $wrappers.removeClass(opts.errorClass).find("." + opts.fieldErrorClass).remove();

                for (var fieldName in errors_list) {
                    var errors = errors_list[fieldName];

                    if (fieldName.search("__all__") >= 0) {
                        $form.trigger("ajaxforms:nonfielderror", [errors]);
                        nonfielderror = true;
                    } else {
                        var $field = $form.find("#" + opts.fieldIdSelector + fieldName);

                        var onChange = function () {
                            $field.removeClass('error', 200).find('.errorlist').fadeOut(200, function () {
                                $(this).remove();
                            });
                        };

                        $field.addClass(opts.errorClass).append(this.renderErrorList(errors));
                        $field.one('change', onChange);
                    }
                }
                if ( !nonfielderror ){
                    $form.trigger("ajaxforms:fielderror");
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
                var $elem = $("<div>").addClass(opts.fieldErrorClass).text(errorsList.join(', '));

                if ( $.isFunction( opts.onRenderErrorFn ) ) {
                    $elem = opts.onRenderErrorFn( $elem, errorsList );
                }

                return $elem;
            }
        };

        if ( methods[options] ) {
            return methods[ options ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof options === 'object' || ! options ) {
            return this.each(function()
            {
                var $this = $(this);
                var daf = $this.data('daf-data');

                if (!daf) {
                    new DjangoAjaxForms($this);
                }
            });
        } else {
            $.error( 'Method ' +  options + ' does not exist.' );
        }
    };

    $.fn.djangoAjaxForms.defaults = {};

})(jQuery);
