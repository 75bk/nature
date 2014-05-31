var test = require("tape");
var Design = require("../lib/Design");

var attributes = [
    { name: "verbose", type: Boolean },
    { name: "colour" },
    { name: "number", type: Number },
    { name: "colours", type: Array }
];

test("Model has correct values", function(t){
    var design = Design(attributes);
    var model = design.create();
    t.equal(model.verbose, undefined);
    t.equal(model.colour, undefined);
    t.equal(model.number, undefined);
    t.equal(model.colours, undefined);
    t.end();
});
