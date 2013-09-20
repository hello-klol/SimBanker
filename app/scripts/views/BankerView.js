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

    var MEDIUM_BANKER_THRESHOLD = 4000,
        FAT_BANKER_THRESHOLD = 8000;

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
            if(this.banker.amount < 1000 && this.$('.research-container').find('#Loan').length == 0) {
                this.$('.research-container').append(researchTemplate({research: "Loan"}));
                $('#Loan').on('click', function() {
                    self.banker.amount += self.loanHelper.getLoan();
                    new TooltipHelper().removeTooltip(self.loantooltip);
                    $(this).off('click');
                    $(this).remove();
                });

                $('#Loan').hover(function() {
                    self.loantooltip = new TooltipHelper().displayTooltip("You're low on funds! Best take a loan.", $('#Loan'));
                }, function() {
                    new TooltipHelper().removeTooltip(self.loantooltip);
                });

            } else if(this.banker.amount > 1000 && this.$('.research-container').find('#Loan').length >= 0) {
                new TooltipHelper().removeTooltip(self.loantooltip);
                $('#Loan').off('click');
                $('#Loan').remove();
            }
        },

        showSubprimeUpgrade: function(){
            var self = this;
            if(this.$('.research-container').find('#sub-prime').length == 0 && !this.upgradesUnlocked.subprime) {
                this.upgradesUnlocked.subprime = true;
                this.$('.research-container').append(researchTemplate({research: "sub-prime"}));

                $('#sub-prime').hover(function() {
                    self.subprimetooltip = new TooltipHelper().displayTooltip("More mortgages appear in the market!", $('#sub-prime'));
                }, function() {
                    new TooltipHelper().removeTooltip(self.subprimetooltip);
                });

                $('#sub-prime').on('click', function() {
                    self.triggerSubPrime();
                    new TooltipHelper().removeTooltip(self.subprimetooltip);
                    self.spawnHelper.addBroker();
                    $(this).off('click');
                    $(this).remove();
                });
            }
        },

        triggerSubPrime: function() {
            this.trigger('switchToSubPrime');
        },

        updateCalculatorDisplay: function(){
            var formattedAmount = formatNaturalNumber(this.banker.amount.toFixed(2));

            this.$('.calculator-display').html(formattedAmount);
        },

        updateBankerImage: function(){
            var amount = this.banker.amount;

            if(amount >= MEDIUM_BANKER_THRESHOLD && amount < FAT_BANKER_THRESHOLD){
                this.showMediumBanker();
            } else if(amount >= FAT_BANKER_THRESHOLD){
                this.showFatBanker();
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