define(function() {
    'use strict';

/* Investor demand/visits should be determined by increase in housing prices.
Becoming more frequent as increase in house prices steepens.
Disappearing altogether when house prices drop. */
    return Backbone.Model.extend({

        initialize: function(){
            this.visitInterval = 15000;
            this.allowVisit = true;
            this.investorTypes = [
                'low',
                'med',
                'high'
            ];
            window.setTimeout(_.bind(this.triggerVisit, this), this.nextVisitTime());

        },

        nextVisitTime: function() {
            return Math.random() * this.visitInterval;
        },

        triggerVisit: function(){
            if(this.allowVisit) {
                var typeIndex = (Math.random() * 3);
                typeIndex = Math.floor(typeIndex);
                this.trigger('triggerVisit', this.investorTypes[typeIndex]);
                window.setTimeout(_.bind(this.triggerVisit, this), this.nextVisitTime());
            }
        },

        stopInvestors: function(){
            this.allowVisit = false;
        },

        setVisitInterval: function(interval){
            this.visitInterval = interval;
        },

        increaseVisitInterval: function() {
            this.visitInterval = this.visitInterval*1.3;
        }


    });

});