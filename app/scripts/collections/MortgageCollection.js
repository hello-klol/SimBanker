define([
    'models/MortgageModel'
], function(
    MortgageModel
){
    'use strict';

    return Backbone.Collection.extend({

        defaultChance: 0.01,

        model: MortgageModel,

        mortgageDefault: function(){
            var randomIndex, randomMortgage;

            if(this.isEmpty()){
                return;
            }

            if(Math.random() < this.defaultChance){
                randomIndex = Math.floor(Math.random() * this.length);
                randomMortgage = this.at(randomIndex);
                randomMortgage.isDefaulted = true;
                this.trigger('defaulted', randomMortgage.toJSON());
                this.remove(randomMortgage);
            }
        },

        setDefaultChance: function(defaultChance) {
            this.defaultChance = defaultChance;
        },

        increaseDefaultChance: function() {
            this.defaultChance = this.defaultChance * 1.2;
        }

    });

});