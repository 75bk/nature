var test = require("tape");
var Design = require("../lib/Design");
var Model = require("../lib/Model2");

var attributes = [
    { name: "verbose", type: Boolean },
    { name: "dry", type: Boolean }
];

test("design.create() returns Model instance", function(t){
    var design = Design(attributes);
    t.ok(design.create() instanceof Model);
    t.end();
});
