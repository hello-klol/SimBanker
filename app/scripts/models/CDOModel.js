define([

], function(

){
    'use strict';

    return Backbone.Model.extend({
        initialize: function(){
           this.isDefaulted = false;
        },
    });
});
