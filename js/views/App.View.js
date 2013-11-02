define([
    "jquery",
    "underscore",
    "backbone",
    "d3",
    "app/collections/Costs.Collection",
    "text!app/templates/CostsList.Template.html",
    "app/visualizations/Costs.Visualization"
], function(
    $,
    _,
    Backbone,
    d3,
    CostsCollection,
    CostsListTemplate,
    CostsVisualization
) {
    return Backbone.View.extend({
        initialize: function() {
            this.costs = new CostsCollection();
            this.costsChart = new CostsVisualization();

            this.costs.on("reset", _.bind(this.renderCosts, this));
            this.costs.on("reset", _.bind(this.updateCostsChart, this));
        },
        render: function() {
            this.costs.fetch();
            this.costsChart($("#costsSVG")[0]);
        },
        renderCosts: function() {
            var byCity = {},
                min = this.costs.chain()
                    .map(function(model) {
                        return Number(model.get("Annual Total").replace(/[^0-9\.]+/g,""));
                    }).min().value(),
                max = this.costs.chain()
                    .map(function(model) {
                        return Number(model.get("Annual Total").replace(/[^0-9\.]+/g,""));
                    }).max().value(),
                opacity = d3.scale.linear()
                    .domain([min, max])
                    .range([0.45, 1]),
                weight = d3.scale.linear()
                    .domain([min, max])
                    .range([500, 500]);
            this.costs.chain()
                .groupBy(function(model) {
                    return model.get("City");
                }).each(function(val, key) {
                    var mapped = _.map(val, function(model) {
                        var obj = {};
                        obj.cid = model.cid;
                        obj.TYPE = model.get("TYPE");
                        obj.City = model.get("City");
                        obj.Total = model.get("Annual Total");
                        obj.total = Number(obj.Total.replace(/[^0-9\.]+/g,""));
                        obj.opacity = opacity(obj.total);
                        obj.weight = Math.round(weight(obj.total) / 100) * 100;
                        return obj;
                    });
                    byCity[key] = mapped;
                });
            $("#costsList").html(_.template(CostsListTemplate, {data: byCity}));
        },
        updateCostsChart: function() {

        }
        // renderCost: function(model) {

        // }
    });
})