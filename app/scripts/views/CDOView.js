define([
    'mustache!cdo',
    'helpers/TooltipHelper'
], function(
    cdoTemplate,
    TooltipHelper
){
    'use strict';

    return Backbone.View.extend({

        initialize: function(){
        },

        render: function(){
            this.$el = cdoTemplate();
            this.tooltipHelper = new TooltipHelper();
            return this;
        },

        remove: function(){
            var boundRemove = _(Backbone.View.prototype.remove).bind(this);

            if (this.model.isDefaulted) {
                this.tooltipHelper.removeTooltip(this.tooltipHelper.displayTooltip("CDO: Defaulted!", this.$el));
            }
            
            this.$el.animate({opacity: 0}, 1000, function(){
                boundRemove();
            });
        },
    });
});
