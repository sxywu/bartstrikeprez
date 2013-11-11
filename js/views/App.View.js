define([
    "jquery",
    "underscore",
    "backbone",
    "d3",
    "app/collections/Costs.Collection",
    "text!app/templates/CostsList.Template.html",
    "app/visualizations/Costs.Visualization",
    "app/collections/Positions.Collection",
    "text!app/templates/PositionsList.Template.html",
    "app/visualizations/Positions.Visualization",
    "app/visualizations/Histogram.Visualization",
    "app/collections/Proposals.Collection",
    "app/visualizations/Proposals.Visualization",
    "bootstrap"
], function(
    $,
    _,
    Backbone,
    d3,
    CostsCollection,
    CostsListTemplate,
    CostsVisualization,
    PositionsCollection,
    PositionsListTemplate,
    PositionsVisualization,
    HistogramVisualization,
    ProposalsCollection,
    ProposalsVisualization
) {
    return Backbone.View.extend({
        initialize: function() {
            this.costs = new CostsCollection();
            this.costsChart = new CostsVisualization();
            this.positions = new PositionsCollection();
            this.positionsChart = new PositionsVisualization();
            this.costsPositionsChart = new PositionsVisualization();
            this.histogramChart = new HistogramVisualization();
            this.proposals = new ProposalsCollection();
            this.augustChart = new ProposalsVisualization();
            this.octoberChart = new ProposalsVisualization();
            this.proposalCharts = {
                August: this.augustChart,
                October: this.octoberChart
            }

            this.costs.on("reset", _.bind(this.renderCosts, this));
            this.positions.on("reset", _.bind(this.renderPositions, this));
            this.proposals.on("reset", _.bind(this.renderProposals, this));
        },
        render: function() {
            this.costs.fetch();
            this.costsChart($("#costsSVG")[0]);

            this.positions.fetch();
            this.positionsChart($("#positionsSVG")[0]);
            this.costsPositionsChart($("#costsPositionsSVG")[0]);

            this.histogramChart($("#histogramSVG")[0]);

            this.proposals.fetch();
            this.augustChart($("#AugustSVG")[0]);
            this.octoberChart($("#OctoberSVG")[0]);
        },
        renderCosts: function() {
            var min = this.costs.getMin(),
                max = this.costs.getMax();
            this.renderCostsList(min, max);
            this.updateCostsChart(min, max);

            // $("#costsList2 .cost").mouseover(_.bind(this.mouseoverCost, this));
            // $("#costsList2 .cost").mouseout(_.bind(this.mouseleaveCost, this));
            $("#costsList2 .cost").click(_.bind(this.clickCost, this));
        },
        renderCostsList: function(min, max) {
            var byCity = {},
                opacity = d3.scale.linear()
                    .domain([min, max])
                    .range([0.45, 1]);
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
                        return obj;
                    });
                    byCity[key] = mapped;
                });
            $("#costsList").html(_.template(CostsListTemplate, {data: byCity}));
            $("#costsList2").html(_.template(CostsListTemplate, {data: byCity}));
            $("#costsList2 .city").css("color", "#655643");
        },
        updateCostsChart: function(min, max) {
            var data = this.costs.chain()
                .map(function(model) {
                    var obj = {};
                    obj.cid = model.cid;
                    obj.TYPE = model.get("TYPE");
                    obj.City = model.get("City");
                    obj.Total = model.get("Annual Total");
                    obj.total = Number(obj.Total.replace(/[^0-9\.]+/g,""));
                    return obj;
                }).groupBy(function(obj) {
                    return obj.TYPE;
                }).values().value();

            this.costsChart.data(data).update();
        },
        renderPositions: function() {
            $("#positionsList").html(_.template(PositionsListTemplate, {
                data: this.positions.toJSON()
            }));
            $("#positionsList2").html(_.template(PositionsListTemplate, {
                data: this.positions.toJSON()
            }));

            this.renderPositionsChart();
            this.renderHistogram();
        },
        renderPositionsChart: function() {
            var titles = this.positions.pluck("title"),
                data = this.positions.processData(),
                cost = this.costs.getFirstCost();
            this.positionsChart.titles(titles).data(data)
                .legend().update();
            this.costsPositionsChart.titles(titles).data(data)
                .legend().update().cost(cost).renderCost();
        },
        renderHistogram: function() {
            var data = this.positions.processHistogram();
            this.histogramChart.data(data).update();
        },
        renderProposals: function() {
            var data = this.proposals.getLineData(),
                that = this;
            _.each(data, function(val, key) {
                var chart = that.proposalCharts[key];
                chart.data(val).update();
            });
        },
        clickCost: function(e) {
            $("#costsList2 .cost").removeClass("clicked");
            $(e.target).addClass("clicked");

            var cid = $(e.target).attr("id").replace("cost_", ""),
                cost = this.costs.getCostByCid(cid);
            this.costsPositionsChart.cost(cost).updateCost();
            console.log(cid, cost);
            return false;
        },
        events: {
            "click .reveal .mock2": "enlargeMock"
        },
        enlargeMock: function() {
            console.log("modal");
            $("#modalMock").modal("show");
        }
    });
})