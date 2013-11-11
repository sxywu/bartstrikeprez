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
    return Backbone.Collection.extend({
        fetch: function() {
            var that = this;
            d3.csv("data/bart-comp-all.csv", function(response) {
                var positions = [],
                    histogram = _.map(response, function(position) {
                            var obj = {};
                            obj.union = position.Union;
                            obj.base = parseInt(position.Base);
                            obj.overtime = parseInt(position.OT);
                            obj.other = parseInt(position.Other);
                            obj.pension = parseInt(position.EE) + parseInt(position.ER);
                            obj.medical = parseInt(position.MDV);
                            obj.total = obj.base + obj.overtime + obj.other + obj.pension + obj.medical;

                            return obj;
                        });

                // get union workers
                _.chain(response)
                    .filter(function(position) {
                        return (position.Union === "SEIU") 
                        || (position.Union === "ATU")
                        || (position.Union === "AFSCME");
                    }).groupBy(function(position) {
                        return position.Title;
                    }).each(function(val, key) {
                        if (val.length > 50) {
                            var obj = {};
                            obj.title = key;
                            obj.base = d3.mean(_.pluck(val, "Base"));
                            obj.overtime = d3.mean(_.pluck(val, "OT"));
                            obj.other = d3.mean(_.pluck(val, "Other"));
                            obj.pension = (d3.mean(_.pluck(val, "EE")) + d3.mean(_.pluck(val, "ER"))) / 2;
                            obj.medical = d3.mean(_.pluck(val, "MDV"));
                            obj.total = obj.base + obj.overtime + obj.other + obj.pension + obj.medical;
                            positions.push(obj);
                        }
                    });

                that.histogram = histogram;
                that.reset(positions);
            });
        },
        processData: function() {
          var order = ["base", "overtime", "other", "pension", "medical"],
              starting = 0,
              opacity = 1 / order.length,
              bars = [];

          this.each(function(model) {
            var bar = {};
            bar.parts = [];
            bar.title = model.get("title");
            _.each(order, function(key, i) {
                var obj = {};
                obj.starting = starting;
                obj.ending = starting + model.get(key);
                obj.height = model.get(key);
                obj.opacity = 1 - opacity * i;
                obj.title = key;
                obj.position = model.get("title");

                starting = obj.ending + 1;

                bar.parts.push(obj);
            });
            starting = 0;
            bars.push(bar);
          });            
          
          return bars;
        },
        processHistogram: function() {
            var histogram = {},
                keys = ["ATU", "SEIU", "AFSCME"];

            _.chain(this.histogram)
                .groupBy(function(position) {
                    return Math.round(position.base / 10000) * 10000;
                }).each(function(val, key) {
                    var unions = _.chain(val)
                        .countBy(function(v) {
                            return v.union;
                        }).reduce(function(memo, val, key) {
                            return memo + (_.contains(keys, key) ? val : 0);
                        }, 0).value(),
                        others = val.length - unions;
                    histogram[key] = {bars: [{name: "unions", bar: unions}, 
                        {name: "others", bar: others}], 
                        key: key}
                }).value();

            return histogram;
        }
    });
});