define([
    'mustache!tooltip'
], function(
    tooltipTemplate
) {
    'use strict';

    return Backbone.Model.extend({

        initialize: function(){

        },

        displayTooltip: function(s, after) {
            var tooltipData = {
                message: s,
                top: after.top - 40,
                left: after.left - 40
            };
            var tooltip = tooltipTemplate(tooltipData);

            tooltip.insertAfter(after);

            return tooltip;
            
        },

        removeTooltip: function(tooltip) {
            tooltip.animate({opacity: 0}, 1000, function() {
                this.remove();
            });
        }




    });

});