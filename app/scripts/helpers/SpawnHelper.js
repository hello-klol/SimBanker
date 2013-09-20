define([
    'helpers/MortgageHelper',
], function(
    MortgageHelper
) {
    'use strict';

    return Backbone.Model.extend({

        initialize: function(){
            this.brokers = 1;
            this.spawnInterval = 500;
            this.houseCount = 1000;
            this.houseTypes = _(MortgageHelper.mortgageTypes).pluck('type');

            window.setTimeout(_.bind(this.spawnMortgage, this), this.nextSpawnTime());

        },

        nextSpawnTime: function() {
            return (Math.random() * this.spawnInterval) /  this.brokers;
        },

        spawnMortgage: function(){
            this.houseCount--;

            var typeIndex = (Math.random() * 3);
            typeIndex = Math.floor(typeIndex);

            this.trigger('spawnMortgage', this.houseTypes[typeIndex]);
            if (this.houseCount > 0) {
                window.setTimeout(_.bind(this.spawnMortgage, this), this.nextSpawnTime());
            }

        },

        addBroker: function() {
            //this.brokers++;
        },

        setSpawnInterval: function(interval) {
            this.spawnInterval = interval;
            console.log("Spawn interval set to " + interval);
        }

    });

});