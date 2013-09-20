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
    'helpers/LoanHelper',
     'mustache!gameOver'
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
    LoanHelper,
    gameOver
) {
    'use strict';

    return Backbone.View.extend({

        initialize: function(){

            this.clickCount = 0;
            this.subprime = false;

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
            this.listenTo(this.bankerView, 'switchToSubPrime', this.switchToSubPrime);
            this.listenTo(this.mortgageInventoryView.collection, 'defaulted', this.onDefault);
            this.listenTo(this.cdoInventoryView.collection, 'defaultedCDO', this.onDefaultCDO);
        },

        events: {
            //"click": "advanceTicker",
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
            console.log("Default rate " + this.mortgageInventoryView.collection.defaultChance);
            console.log("Spawn interval " + this.mortgageMarketView.spawnHelper.spawnInterval);
            console.log("My mortgage count " + this.mortgageInventoryView.getNoMortgages());

            if(this.mortgageInventoryView.collection.defaultChance>0.65 
                && this.mortgageInventoryView.getNoMortgages()==0
                && (this.banker.amount < 500 || this.mortgageMarketView.spawnHelper.spawnInterval > 20000)) {
                if(this.$('.game-over-div').find('.game-over').length == 0) {
                    var timeout = window.setTimeout(function() {
                        this.$('.game-over-div').append(gameOver());
                    }, 10000);
          
                }
            }
            
            this.income.loan = this.loanHelper.getPayment();

            this.incomeView.updateIncomeIncrement();

            this.banker.amount += (this.income.increment - this.income.loan);
            
            if(this.mortgageMarketView.spawnHelper.spawnInterval>10000) {
                this.bankerView.showSubprimeUpgrade();
            }

            this.mortgageInventoryView.collection.mortgageDefault();
            this.cdoInventoryView.collection.cdoDefault();

            this.bankerView.updateBankerImage(this.clickCount);
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
                
                //every time a mortgage is bought, increase the interval between mortgages showing
                this.mortgageMarketView.spawnHelper.spawnInterval = this.mortgageMarketView.spawnHelper.spawnInterval*1.2;

                if(this.clickCount % 3 == 0) {
                    this.housePriceView.updatePrice();
                }

                if(this.subprime) {
                     this.mortgageInventoryView.collection.increaseDefaultChance();
                     if(this.mortgageInventoryView.collection.defaultChance>0.4) {
                        this.investorView.investorHelper.stopInvestors();
                        this.bankerView.showEvilBanker();
                     } else {
                         this.investorView.investorHelper.increaseVisitInterval();
                     }
                }

                this.banker.amount -= worth;
                this.income.increment += mortgageModel.get('valuation');
                this.incomeView.updateIncomeIncrement();

                this.mortgageInventoryView.collection.add(mortgageModel);
                mortgage.remove();
            } else {
                this.mortgageMarketView.displayLowFundsTooltip();
            }
        },

        switchToSubPrime: function() {
            this.subprime = true;
            this.mortgageMarketView.spawnHelper.setSpawnInterval(500);
            this.mortgageInventoryView.collection.increaseDefaultChance();
            this.mortgageMarketView.spawnHelper.spawnMortgage();
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
        },

        onDefaultCDO: function(cdo){
            var total = 0;

            _.each(cdo.get('mortgages'), function(m) {
                total += m.get('valuation');

            });

            this.income.increment -= total;
            this.incomeView.updateIncomeIncrement();

            this.banker.amount += total;
            this.bankerView.updateCalculatorDisplay();
        }

    });

});
