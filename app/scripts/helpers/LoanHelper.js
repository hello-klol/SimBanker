define([
    
], function(
    
) {
    'use strict';

    return Backbone.Model.extend({

        initialize: function(){
            this.interest = 0.0;
            this.outstandingLoan = 0;
        },


        getLoan: function() {
            this.outstandingLoan += 2000;
            this.interest += 0.05;
            return 2000;
        },

        getPayment: function() {
            if (this.outstandingLoan > 0 ) {
                return (this.outstandingLoan * this.interest) / 100;
            }

            return 0;
        }

    });

});