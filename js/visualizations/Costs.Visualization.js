define([
    "jquery",
    "underscore",
    "d3",
    "d3.tip"
], function(
    $,
    _,
    d3,
    tip
) {
    return function() {
        var svg, $svg, xAxis, yAxis,
            groups, bars,
            data = [],
            max = 125000,
            padding = {top: 25, left: 75, right: 25},
            width, height = 500, x, y,
            barWidth = 10
            barPadding = 2;

        /*
            set up the initial chart
        */
        function CostsChart(selection) {
            svg = d3.select(selection);
            $svg = $(selection);
            width = $svg.width();
            // height = $svg.height();

            x = d3.scale.ordinal()
                    .domain(["1P1C", "1P2C", "1P3C", "2P1C", "2P2C", "2P3C"])
                    .rangePoints([0, width - padding.left - padding.right]);
            y = d3.scale.linear()
                    .domain([0, max])
                    .range([0, height - padding.top]);
            var yAxisScale = d3.scale.linear()
                    .domain([max, 0])
                    .range([0, height - padding.top]);
            var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom"),
                yAxis = d3.svg.axis()
                    .scale(yAxisScale)
                    .orient("left");

            var xAxisG = svg.append("g")
                .attr("transform", "translate(" + padding.left + ", " + height + ")")
                .classed("xAxis", true)
                .call(xAxis)
                .selectAll("text");
            var yAxisG = svg.append("g")
                .attr("transform", "translate(" + padding.left + ", " + padding.top + ")")
                .classed("yAxis", true)
                .call(yAxis);
        }

        CostsChart.update = function() {
            console.log(data);
            groups = svg.selectAll("g.types")
                .data(data).enter().append("g")
                .classed("types", true)
                .attr("transform", function(d, i) {
                    var groupWidth = ((width - padding.left - padding.right) / 6) / 2,
                        left = x(d[0].TYPE) + padding.left - groupWidth;
                    console.log(groupWidth)
                    return "translate(" + left + ",0)";
                });
            bars = groups.selectAll("rect.bar")
                .data(function(d) {return d;}).enter().append("rect")
                .classed("bar", true)
                .attr("x", function(d, i) {return i * (barPadding + barWidth)})
                .attr("y", function(d) {return height - y(d.total)})
                .attr("width", barWidth)
                .attr("height", function(d) {return y(d.total)})
                .attr("fill", "#666");

        }

        CostsChart.data = function(value) {
            if (!arguments.length) return data;
            data = value;
            return CostsChart;
        }

        return CostsChart;
    }
});