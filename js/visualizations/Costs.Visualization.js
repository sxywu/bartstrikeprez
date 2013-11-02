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
            data = [],
            max = 175000,
            padding = {top: 25, left: 75},
            width, height = 500, x, y;

        /*
            set up the initial chart
        */
        function CostsChart(selection) {
            svg = d3.select(selection);
            $svg = $(selection);
            width = $svg.width();
            // height = $svg.height();

            y = d3.scale.ordinal()
                    .domain(["1P1C", "1P2C", "1P3C", "2P1C", "2P2C", "2P3C"])
                    .rangePoints([0, height - padding.top]);
            x = d3.scale.linear()
                    .domain([0, max])
                    .range([0, width - padding.left]);
            // var yAxisScale = d3.scale.linear()
            //         .domain([max, 0])
            //         .range([0, height - padding.top]);
            var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom"),
                yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left");

            var xAxisG = svg.append("g")
                .attr("transform", "translate(" + padding.left + ", " + height + ")")
                .classed("xAxis", true)
                .call(xAxis)
                .selectAll("text")
                    .attr("y", 0)
                    .attr("x", 9)
                    .attr("dy", ".35em")
                    .attr("transform", "rotate(45)")
                    .style("text-anchor", "start");
            var yAxisG = svg.append("g")
                .attr("transform", "translate(" + padding.left + ", " + padding.top + ")")
                .classed("yAxis", true)
                .call(yAxis);
        }

        CostsChart.data = function(value) {
            if (!arguments.length) return data;
            return lineChart;
        }

        return CostsChart;
    }
});