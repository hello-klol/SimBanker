define([
    'mustache!banker',
    'mustache!research',
    'helpers/TooltipHelper'
], function(
    bankerTemplate,
    researchTemplate,
    TooltipHelper
){
    'use strict';

    var MEDIUM_BANKER_THRESHOLD = 5000,
        FAT_BANKER_THRESHOLD = 20000,
        EVIL_BANKER_THRESHOLD = 50000;

    function formatNaturalNumber(number){

        if (number < 0) {
            return number.toString();
        }

        if(!_.isNumber(number) || isNaN(number)){
            return number || '';
        }

        return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + ',');
    }


    return Backbone.View.extend({

        initialize: function(options){
            console.log(options);
            this.banker = options.banker;
            this.spawnHelper = options.spawnHelper;
            this.loanHelper = options.loanHelper;
            this.upgradesUnlocked = {};
        },

        render: function(){
            this.$el.append(bankerTemplate());
            this.updateCalculatorDisplay();
        },

        updateResearchPanel: function() {
            var self = this;


            if(this.banker.amount < 1000 && this.$('.research-container').find('#loan').length == 0) {
                this.$('.research-container').append(researchTemplate({research: "loan"}));
                $('#loan').on('click', function() {
                    self.banker.amount += self.loanHelper.getLoan();
                    $(this).off('click');
                    $(this).remove();
                });

                $('#loan').hover(function() {
                    self.loantooltip = new TooltipHelper().displayTooltip("You're running low on funds! Best take a loan.", $('#loan'));
                }, function() {
                    new TooltipHelper().removeTooltip(self.loantooltip);
                });



            } else if(this.banker.amount > 1000 && this.$('.research-container').find('#loan').length >= 0) {
                new TooltipHelper().removeTooltip(self.loantooltip);
                $('#loan').off('click');
                $('#loan').remove();
            }


            if (this.banker.amount >= 10000 && !this.upgradesUnlocked.subprime) {
                this.upgradesUnlocked.subprime = true;
                this.$('.research-container').append(researchTemplate({research: "sub-prime"}));

                $('#sub-prime').hover(function() {
                    self.subprimetooltip = new TooltipHelper().displayTooltip("Twice as many mortgages appear in the market! What could go wrong!", $('#sub-prime'));
                }, function() {
                    new TooltipHelper().removeTooltip(self.subprimetooltip);
                });

                $('#sub-prime').on('click', function() {
                    new TooltipHelper().removeTooltip(self.subprimetooltip);
                    self.spawnHelper.addBroker();
                    $(this).off('click');
                    $(this).remove();
                });
            }
        },

        updateCalculatorDisplay: function(){
            var formattedAmount = formatNaturalNumber(this.banker.amount.toFixed(2));

            this.$('.calculator-display').html(formattedAmount);
        },

        updateBankerImage: function(){
            var amount = this.banker.amount;

            if(amount >= MEDIUM_BANKER_THRESHOLD && amount < FAT_BANKER_THRESHOLD){
                this.showMediumBanker();
            } else if(amount >= FAT_BANKER_THRESHOLD && amount < EVIL_BANKER_THRESHOLD){
                this.showFatBanker();
            } else if(amount >= EVIL_BANKER_THRESHOLD){
                this.showEvilBanker();
            }
        },

        showMediumBanker: _(function(){
            this.$('.banker-image-container img').attr('src', 'img/banker/MainBanker2.png');
        }).once(),

        showFatBanker: _(function(){
            this.$('.banker-image-container img').attr('src', 'img/banker/MainBanker3.png');
        }).once(),

        showEvilBanker: _(function(){
            this.$('.banker-image-container img').attr('src', 'img/banker/MainBanker4.png');
        }).once()

    });
});