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
                var positions = [];

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
                            obj.title = key.replace(" ", "_");
                            obj.base = d3.mean(_.pluck(val, "Base"));
                            obj.other = d3.mean(_.pluck(val, "Other"));
                            obj.pension = (d3.mean(_.pluck(val, "EE")) + d3.mean(_.pluck(val, "ER"))) / 2;
                            obj.medical = d3.mean(_.pluck(val, "MDV"));
                            obj.total = obj.base + obj.other + obj.pension + obj.medical;
                            positions.push(obj);
                        }
                    });

                that.reset(positions);
            });
        },
        processData: function() {
          var order = ["base", "other", "pension", "medical"],
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
        }
    });
});