define([
    "jquery",
    "underscore",
    "backbone",
    "d3"
], function(
    $,
    _,
    Backbone,
    d3
) {
    var cities = {
        "Oakland-Fremont, CA HUD Metro FMR Area": "Oakland, Fremont",
        "San Francisco, CA HUD Metro FMR Area": "San Francisco",
        "San Jose-Sunnyvale-Santa Clara, CA HUD Metro FMR Area": "San Jose, Sunnyvale, Santa Clara",
        "Vallejo-Fairfield, CA MSA": "Vallejo/Fairfield"
    }
    currencyToInt = function(curr) {
        return Number(curr.replace(/[^0-9\.]+/g,""));
    };
    return Backbone.Collection.extend({
        fetch: function() {
            var that = this;
            d3.csv("data/ca-family-budget.csv", function(response) {
                var costs = _.chain(response)
                    .filter(function(cost) {
                        return _.contains(_.keys(cities), cost.AREANAME);
                    }).map(function(cost) {
                        cost.City = cities[cost.AREANAME];
                        delete cost.AREANAME;
                        delete cost.STATE;

                        return cost;
                    }).value();
                that.reset(costs);
            });
        },
        getMin: function() {
            return this.chain()
                .map(function(model) {
                    return currencyToInt(model.get("Annual Total"));
                }).min().value();
        },
        getMax: function() {
            return this.chain()
                .map(function(model) {
                    return currencyToInt(model.get("Annual Total"));
                }).max().value();
        },
        getFirstCost: function() {
            return currencyToInt(this.at(0).get("Annual Total"));
        },
        getCostByCid: function(cid) {
            return currencyToInt(this.get(cid).get("Annual Total"));
        }
    });
})