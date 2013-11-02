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
        }
    });
})