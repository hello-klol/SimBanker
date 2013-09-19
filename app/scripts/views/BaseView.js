define([
    'views/MortgageMarketView',
    'views/NewsTickerView',
    'views/HousePriceView',
    'views/IncomeView',
    'views/MortgageInventoryView',
    'views/CDOInventoryView',
    'views/BankerView',
    'views/InvestorsView',
    'helpers/MortgageHelper',
    'helpers/InvestorDemandHelper',
    'mustache!base',
    'helpers/LoanHelper'
], function(
    MortgageMarketView,
    NewsTickerView,
    HousePriceView,
    IncomeView,
    MortgageInventoryView,
    CDOInventoryView,
    BankerView,
    InvestorsView,
    MortgageHelper,
    InvestorDemandHelper,
    baseTemplate,
    LoanHelper
) {
    'use strict';

    return Backbone.View.extend({

        initialize: function(){

            this.clickCount = 0;

            this.banker = {
                amount: 0
            };

            this.income = {
                increment: 0,
                loan: 0
            };

            this.loanHelper = new LoanHelper();


            this.mortgageMarketView = new MortgageMarketView();
            this.newsTickerView = new NewsTickerView();
            this.housePriceView = new HousePriceView();

            this.mortgageInventoryView = new MortgageInventoryView();
            this.cdoInventoryView = new CDOInventoryView({
                banker: this.banker,
                mortgagesInventory: this.mortgageInventoryView.collection
            });

            this.bankerView = new BankerView({
                banker: this.banker,
                spawnHelper: this.mortgageMarketView.spawnHelper,
                loanHelper: this.loanHelper
            });
            this.incomeView = new IncomeView({
                income: this.income
            });

            this.investorView = new InvestorsView({
                cdoInventory: this.cdoInventoryView.collection,
                banker: this.banker
            });

            this.listenTo(this.mortgageMarketView, 'boughtMortgage', this.onBoughtMortgage);
            this.listenTo(this.bankerView, 'broughtUpgrade', this.onBroughtUpgrade);
            this.listenTo(this.investorView, 'soldCDO', this.onSoldCDO);
            this.listenTo(this.bankerView, 'gotLoan', this.onGotLoan);
            this.listenTo(this.mortgageInventoryView.collection, 'defaulted', this.onDefault);
        },

        events: {
            "click": "advanceTicker",
        },

        advanceTicker: function() {
            this.newsTickerView.updateTicker();
        },
            

        render: function(){
            this.$el.html(baseTemplate());

            this.mortgageMarketView.$el = this.$('.mortgage-market');
            this.mortgageMarketView.render();

            this.newsTickerView.$el = this.$('.news-ticker');
            this.newsTickerView.render();

            this.housePriceView.$el = this.$('.house-price');
            this.housePriceView.render();

            this.bankerView.$el = this.$('.banker');
            this.bankerView.render();

            this.incomeView.$el = this.$('.income-counter');
            this.incomeView.render();

            this.mortgageInventoryView.$el = this.$('.mortgage-inventory');
            this.mortgageInventoryView.render();

            this.cdoInventoryView.$el = this.$('.cdo-inventory');
            this.cdoInventoryView.render();

            this.investorView.$el = this.$('.investors');
            this.investorView.render();

            this.setTicker();
        },

        setTicker: function(){
            if(this.ticker){
                clearTimeout(this.ticker);
            }

            this.ticker = setTimeout(_(this.onTick).bind(this), 1000);
        },

        onTick: function(){

            this.income.loan = this.loanHelper.getPayment();

            this.incomeView.updateIncomeIncrement();

            this.banker.amount += (this.income.increment - this.income.loan);
            if(this.banker.amount>10000){
                this.mortgageMarketView.spawnHelper.setSpawnInterval(15000);
            }
            if(this.banker.amount>30000){
                this.mortgageMarketView.spawnHelper.setSpawnInterval(60000);
            }

            this.mortgageInventoryView.collection.mortgageDefault();

            this.bankerView.updateBankerImage();
            this.bankerView.updateCalculatorDisplay();
            this.bankerView.updateResearchPanel();

            this.setTicker();
        },

        onBoughtMortgage: function(mortgage){
            var type = mortgage.data('type');
            var mortgageModel = MortgageHelper.createModel(type);
            var worth =  mortgageModel.get('valuation') * 500
            if (this.banker.amount > worth) {
                this.clickCount++;
                
                if(this.clickCount % 3 == 0) {
                    this.housePriceView.updatePrice();
                }

                if(this.clickCount>102) {
                    this.investorView.investorHelper.stopInvestors();
                    this.mortgageInventoryView.collection.setDefaultChance(0.4);
                }

                this.banker.amount -= worth;
                this.income.increment += mortgageModel.get('valuation');
                this.incomeView.updateIncomeIncrement();

                this.mortgageInventoryView.collection.add(mortgageModel);
                mortgage.remove();
            }else {
                this.mortgageMarketView.displayLowFundsTooltip();
            }
        },

        onBroughtUpgrade: function(upgrade) {
            if (upgrade == "sub-prime") {
                this.clickCount = 96;
                this.investorView.investorHelper.setVisitInterval(25000);
                this.housePriceView.subPrimePricing();
                this.mortgageInventoryView.collection.setDefaultChance(0.1);
            };
        },

        onSoldCDO: function(cdo) {

            var total = 0;

            _.each(cdo.get('mortgages'), function(m) {
                total += m.get('valuation');

            });
            this.income.increment -= total;
            this.incomeView.updateIncomeIncrement();
        },

        onDefault: function(mortgage){
            this.income.increment -= mortgage.valuation;
            this.incomeView.updateIncomeIncrement();

            this.banker.amount += mortgage.valuation;
            this.bankerView.updateCalculatorDisplay();
        }

    });

});
