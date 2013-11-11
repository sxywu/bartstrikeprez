define([
    "jquery",
    "underscore",
    "backbone"
], function(
    $,
    _,
    Backbone
) {
    var parties = {
            "BR": "Raise,BART",
            "UR": "Raise,Union",
            "BP": "Pension,BART",
            "UP": "Pension,Union",
            "BM": "Medical,BART",
            "UM": "Medical,Union"
        },
        invertedParties = _.invert(parties);
    return Backbone.Collection.extend({
        fetch: function() {
            var that = this;
            d3.csv("data/proposals.csv", function(data) {
                _.each(data, function(attrs) {
                    var keys = _.chain(attrs).keys().without("month").value();
                    _.each(keys, function(key) {
                        attrs[key] = $.parseJSON(attrs[key]);
                    });
                });
                that.reset(data);
            });
        },
        getLineData: function() {
            var data = {};
            this.each(function(model) {
                var monthData = {},
                    keys = _.chain(model.attributes)
                        .keys().without("month").value(),
                    attributes = model.attributes;

                _.each(keys, function(key) {
                    var keys = key.split(","),
                        type = keys[0],
                        party = keys[1],
                        val = attributes[key],
                        array = _.map(val, function(rate, i) {
                            var obj = {};
                            obj.party = party;
                            obj.year = i + 1;
                            obj.rate = (rate / 100).toFixed(3);
                            return obj;
                        });
                    
                    if (monthData[type]) {
                        monthData[type].push(array);
                    } else {
                        monthData[type] = [array];
                    }
                });

                data[model.get("month")] = monthData;
            });
            

            return data;
        }
    });
});