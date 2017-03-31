/* globals jQuery */

/******************************************************************
 * Author: Dipcode
 *
 * Modal with content loaded by ajax support
 * https://github.com/VodkaBears/Remodal#remodal
 *****************************************************************/

(function($) {
    "use strict";

    $.modalPartial = function(url, options)
    {
        var opts = $.extend({
            selector: "modalPartials",
            remodal: {}
        }, $.modalPartial.defaults, options);

        var deferred = $.Deferred();

        function getModal(id) {
            return $("[data-remodal-id=" + id + "]");
        }

        if (url) {
            var modal = getModal(opts.selector);
            modal.remodal(opts.remodal).open();

            $.ajax({
                method: "GET",
                url: url
            })
            .done(function(data) {
                modal.find(".remodal-content").html(data.content)
                    .promise().done(function(){
                        deferred.resolve(modal);
                    });
            })
            .fail(function(e) {
                deferred.reject(e);
            });
        }

        return deferred.promise();
    };

    $.modalPartial.defaults = {};


    $(document).ready(function () {

        $(document).on('click', "[data-partial-url]", function (e) {
            e.preventDefault();
            var noajaxsubmit = $(this).attr("data-noajax-submit");
            $.modalPartial( $(this).data("partial-url") ).done(function(modal){
                if(noajaxsubmit !== ''){
                    modal.find('form').djangoAjaxForms();
                }
            });
        });

    });

})(jQuery);
