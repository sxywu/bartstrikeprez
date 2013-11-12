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
        var data, domain = [],
            max = 750,
            width = 960,
            barWidth = 10,
            height = 325,
            barPadding = 2,
            padding = {top: 45, left: 75, right: 75},
            svg, groups, rects,
            x, y, xAxis, yAxis, xAxisG, yAxisG,
            tip = d3.tip().attr('class', 'd3-tip')
                .direction("n")
                .html(function(d) {
                    return d.name + ": " + d.bar;
                });

        function Histogram(selection) {
            svg = d3.select(selection);
            // width = $(selection).width();

            x = d3.scale.linear()
                    .domain(domain)
                    .range([0, width - padding.left - padding.right]);
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
                .attr("transform", "translate(" + (padding.left + barWidth) + ", " + (height + barPadding) + ")")
                .classed("xAxis", true)
                .call(xAxis);
            yAxisG = svg.append("g")
                .attr("transform", "translate(" + (padding.left + barPadding) + ", " + padding.top + ")")
                .classed("yAxis", true)
                .call(yAxis);

            return Histogram;
        }

        Histogram.update = function() {
            domain = _.keys(data);
            x.domain([_.first(domain), _.last(domain)]);
            xAxis.ticks(20).scale(x);
            xAxisG.call(xAxis)
                .selectAll("text")
                .text(function(d) {return "$" + d / 1000 + "K"});

            groups = svg.selectAll("g.groups").data(_.values(data))
                .enter().append("g").classed("group", true)
                .attr("transform", function(d) {
                    return "translate(" + (padding.left + barPadding + x(d.key)) + ",0)";
                });

            rects = groups.selectAll("rect")
                .data(function(d) {return d.bars})
                .enter().append("rect")
                .attr("x", function(d, i) {return i * barWidth})
                .attr("y", function(d) {return height - y(d.bar)})
                .attr("width", barWidth)
                .attr("height", function(d) {return y(d.bar)})
                .attr("fill", function(d) {return app.colors[d.name]})
                .call(tip)
                .on("mouseover", tip.show)
                .on("mouseleave", tip.hide);
            return Histogram;
        }

        /* getter/setters */
        Histogram.data = function(value) {
            if (!arguments.length) return data;
            data = value;
            return Histogram;
        }

        Histogram.max = function(value) {
            if (!arguments.length) return max;
            max = value;
            return Histogram;
        }

        return Histogram;
    }
});