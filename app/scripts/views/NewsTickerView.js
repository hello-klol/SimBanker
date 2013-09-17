define([
    'text!json/headlines.json',
    'mustache!newsItem',
    'mustache!ticker'
], function(
    headlines,
    newsItemTemplate,
    tickerTemplate
){
    'use strict';

    return Backbone.View.extend({

        initialize: function(){
            this.age=0;
            this.items=JSON.parse(headlines);
        },

        render: function(){
            this.$el.append(tickerTemplate());
            this.updateTicker();
        },

        updateTicker: function(){
            this.age++;
            //if avgHousePrice >= item.housePrice pop item from array and display in newsItem template
            var nextNewsItem = this.items[this.age % this.items.length];
            var newsItem = newsItemTemplate(nextNewsItem);
            this.$el.html(newsItem);
        },
    });
});

