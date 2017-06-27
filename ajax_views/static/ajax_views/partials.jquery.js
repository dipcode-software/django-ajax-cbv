/* globals jQuery */

/******************************************************************
 * Author: Dipcode
 *****************************************************************/

(function($) {
    "use strict";

    $.fn.djangoPartials = function (options) {

        var opts = $.extend({
            injectInSelector: null,
            previousContentData: 'previous-content'
        }, $.fn.djangoPartials.defaults, options);


        function DjangoPartials ($elem) {

            var self = this;
            var $partialContainer = $($elem.data('partial'));
            var partialUrl = $elem.data('partial-url');

            $elem.on('click', function () {

                var partialData = $(this).data('partial-data') || {};
                // redefine previous content
                var previousContent = $partialContainer.data(opts.previousContentData);

                if (previousContent) {
                    self.injectPartial($partialContainer, previousContent);
                }

                $elem.trigger('partial:loading', [$partialContainer]);

                self.request(partialUrl, partialData).done(function (data) {

                    self.injectPartial($partialContainer, data.content).done(function() {
                        $partialContainer.find('form').djangoAjaxForms();
                        $elem.trigger('partial:contentLoaded', [$partialContainer, data]);
                    });

                }).fail(function() {
                    $elem.trigger('partial:fail', [$partialContainer]);
                }).always(function() {
                    $elem.trigger('partial:finished', [$partialContainer]);
                });

            });
        }

        DjangoPartials.prototype = {

            request: function request(url, data)
            {
                return $.ajax({
                    method: 'GET',
                    url: url,
                    data: data
                });
            },

            injectPartial: function injectPartial($container, data)
            {

                var $injectInElem = $container.find(opts.injectInSelector);

                $injectInElem = $injectInElem.length ? $injectInElem : $container;

                // save previous content in temporary data var of container element
                $container.data(opts.previousContentData, $injectInElem.html());

                return $injectInElem.html(data).promise();
            }
        };

        return this.each(function () {
            new DjangoPartials($(this));
        });
    };


    $.fn.djangoPartials.defaults = {};

})(jQuery);
