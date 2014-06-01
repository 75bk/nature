var test = require("tap").test;
var Design = require("../lib/Design");
var Model = require("../lib/Model2");

test("design.where(model, { groups: 'blah' })", function(t){
    var attributes = [
        {
            groups: "test1",
            attributes: [
                { name: "verbose", type: Boolean },
                { name: "colour", type: String }
            ]
        },
        {
            groups: "test2",
            attributes: [
                { name: "three", type: Boolean },
                { name: "four", type: Boolean }
            ]
        }
    ];

    var design = Design(attributes);
    t.deepEqual(design.groups(), [ "test1", "test2" ]);
    t.end();
});

test("design.where(model, { groups: 'blah' })", function(t){
    var attributes = [
        {
            groups: ["test1", "all"],
            attributes: [
                { name: "verbose", type: Boolean },
                { name: "colour", type: String }
            ]
        },
        {
            groups: ["test2", "all"],
            attributes: [
                { name: "three", type: Boolean },
                { name: "four", type: Boolean }
            ]
        }
    ];

    var design = Design(attributes);
    t.deepEqual(design.groups(), [ "test1", "all", "test2" ]);
    t.end();
});
