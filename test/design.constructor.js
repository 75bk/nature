var test = require("tape");
var Design = require("../lib/Design");
var Model = require("../lib/Model2");

var attributes = [
    { name: "verbose", type: Boolean },
    { name: "dry", type: Boolean }
];

test("constructor returns design instance", function(t){
    var design = Design(attributes);
    t.ok(design instanceof Design);
    t.end();
});

