define([
    "jquery",
    "underscore",
    "d3"
], function(
    $,
    _,
    d3
) {
    return function() {
        var data, x, y, yAxis,
            svg, charts, keys,
            yMax = 0.08,
            yMin = 0,
            width = 960/2,
            height = 450,
            chartPadding = {right: 75, left: 150, top: 15, bottom: 45},
            chartHeight = height / 3,
            tip = d3.tip().attr('class', 'd3-tip')
                .direction("n")
                .html(function(d) {
                    return "Year " + d.year + ": " + (d.rate * 100).toFixed(1) + "%";
                });

        function lineChart(selection) {
            svg = d3.select(selection);
            // width = $(selection).width();

            x = d3.scale.linear()
                .domain([1, 4])
                .range([0, width - (chartPadding.right + chartPadding.left)]);
            y = d3.scale.linear()
                .domain([yMin, yMax])
                .range([chartHeight - (chartPadding.top + chartPadding.bottom), 0]);
            
            yAxis = d3.svg.axis()
                .scale(y).ticks(4)
                .tickFormat(d3.format("%"))
                .orient("left");

            line = d3.svg.line()
                .x(function(d, i) {return x(d.year); })
                .y(function(d, i) {return y(d.rate)});

        }

        lineChart.update = function() {
            console.log(data);

            charts = svg.selectAll("g.chart").data(_.values(data))
                .enter().append("g").classed("chart", true)
                .attr("transform", function(d, i) {
                    return "translate(0, " + chartHeight * i + ")";
                });

            keys = svg.selectAll("text.key").data(_.keys(data))
                .enter().append("text").classed("key", true)
                .attr("x", chartPadding.left / 2)
                .attr("y", function(d, i) {
                    return chartHeight * i + 
                        (chartHeight - chartPadding.top - chartPadding.bottom) / 2;
                }).attr("text-anchor", "middle")
                .text(function(d) {return d; });
            var axis = charts.append("g")
                .attr("class", "yAxis")
                .attr("transform", "translate(" + chartPadding.left + "," + chartPadding.top + ")")
                .call(yAxis);

            lines = charts.append("g")
                .attr("class", "line")
                .attr("transform", "translate(" + chartPadding.left + "," + chartPadding.top + ")")
                .selectAll("path.line")
                .data(function(d) {return d;}).enter().append("path")
                .classed("line", true)
                .attr("d", line)
                .attr("fill", "none")
                .attr("stroke-width", 2)
                .attr("stroke", function(d) {
                    var party = _.chain(d).pluck("party").uniq().value();
                    return app.colors[party]; 
                });

            circles = charts.append("g")
                .attr("class", "circles")
                .attr("transform", "translate(" + chartPadding.left + "," + chartPadding.top + ")")
                .selectAll("circle.dot")
                .data(function(d) {return _.flatten(d)}).enter().append("circle")
                .attr("class", "dot")
                .attr("cx", function(d, i) {return x(d.year)})
                .attr("cy", function(d) {return y(d.rate)})
                .attr("r", 4)
                .attr("fill", function(d) {return app.colors[d.party]})
                .call(tip)
                .on("mouseover", tip.show)
                .on("mouseleave", tip.hide);

        }

        /* getter/setters */

        lineChart.data = function(value) {
            if (!arguments.length) return data;
            data = value;
            return lineChart;
        }
        return lineChart;
    }
});