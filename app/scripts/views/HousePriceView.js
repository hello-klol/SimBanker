define([
    'text!json/avghouseprices.json',
    'mustache!houseprice'
], function(
    prices,
    houseprice
){
    'use strict';

    return Backbone.View.extend({

        initialize: function(){
            this.age=0;
            this.prices=JSON.parse(prices);
            console.log(this.prices);
        },

        render: function(){
            this.$el.append(houseprice({"price":0, "change":0}));
            this.updatePrice();
        },

        updatePrice: function(){
            this.age++;
            var nextPrice = this.prices[this.age % this.prices.length];
            console.log(nextPrice);
            var housepriceitem = houseprice(nextPrice);
            housepriceitem.remove();
            this.$el.html(housepriceitem);
        }

    });
});

