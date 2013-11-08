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
        var data, titles = [],
            max = 110000,
            width,
            barWidth = 13,
            height = 325,
            barPadding = .5,
            padding = {top: 45, left: 75, right: 20},
            svg, bars, rects, legend,
            x, y, xAxis, yAxis, xAxisG, yAxisG;

        

        function stackedBar(selection) {
            svg = d3.select(selection);
            width = $(selection).width();

            x = d3.scale.ordinal()
                    .domain(titles)
                    .rangePoints([0, width - padding.left - padding.right]);
            y = d3.scale.linear()
                    .domain([0, max])
                    .range([0, height - padding.top]);
            var yAxisScale = d3.scale.linear()
                    .domain([max, 0])
                    .range([0, height - padding.top]);

            /*
            axis
            */
            xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");
            yAxis = d3.svg.axis()
                .ticks(6)
                .scale(yAxisScale)
                .orient("left");

            xAxisG = svg.append("g")
                .attr("transform", "translate(" + (padding.left + barWidth) + ", " + height + ")")
                .classed("xAxis", true)
                .call(xAxis);
            yAxisG = svg.append("g")
                .attr("transform", "translate(" + padding.left + ", " + padding.top + ")")
                .classed("yAxis", true)
                .call(yAxis);

            svg.append("text")
                .attr("x", padding.left - 10)
                .attr("y", padding.top)
                .classed("axisTitle", true)
                .attr("text-anchor", "end")
                .text("Annual ($)");

            return stackedBar;
        }

        stackedBar.update = function(duration) {
            x.domain(titles);
            bars = svg.selectAll("g.bars")
                .data(data).enter().append("g")
                .classed("bars", true)
                .attr("transform", function(d) {
                    return "translate(" + (x(d.title) + padding.left + barWidth / 2) + ", 0)";
                });
            rects = bars.selectAll("rect")
                .data(function(d) {return d.parts}).enter().append("rect")
                .attr("x", 0)
                .attr("y", function(d) {return height - y(d.ending)})
                .attr("width", barWidth)
                .attr("height", function(d) {return y(d.height)})
                .attr("opacity", function(d) {return d.opacity})
                .attr("fill", function(d) {return app.colors[d.position]})
                .attr("stroke", "none");

            return stackedBar;
        }

        stackedBar.legend = function() {
            legend = svg.append("g").classed("legend", true)
                .attr("transform", "translate(" + padding.left + ", " + (height + padding.top) + ")");

            legend.selectAll("rect").data(data[0].parts).enter().append("rect")
                .attr("x", function(d, i) {
                    return i * (width - padding.left) / 4;
                }).attr("y", 0)
                .attr("width", (width - padding.left) / 4)
                .attr("height", barWidth)
                .attr("fill", "#655643")
                .attr("opacity", function(d) {return d.opacity});

            legend.selectAll("text").data(data[0].parts).enter().append("text")
                .attr("x", function(d, i) {
                    return i * (width - padding.left) / 4;
                }).attr("y", barWidth)
                .attr("text-anchor", "start")
                .attr("dy", "1em")
                .text(function(d) {return d.title});

            return stackedBar;
        }

        /* getter/setters */
        stackedBar.data = function(value) {
            if (!arguments.length) return data;
            data = value;
            return stackedBar;
        }

        stackedBar.titles = function(value) {
            if (!arguments.length) return titles;
            titles = value;
            return stackedBar;
        }

        stackedBar.max = function(value) {
            if (!arguments.length) return max;
            max = value;
            return stackedBar;
        }

        return stackedBar;
    }
});