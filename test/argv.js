var test = require("tape");
var parse = require("../lib/argv");

test("simple", function(t){
    var argv = [ "--verbose", "-c", "red", "file1.txt", "-n", "2", "file2.txt", "file3.txt" ];
    expectArgs = [
        { name: "verbose", type: Boolean },
        { name: "colour", alias: "c" },
        { name: "number", alias: "n", type: Number },
        { name: "files", defaultOption: true }
    ];
    t.deepEqual(parse(argv, expectArgs), {
        verbose: true,
        colour: "red",
        number: 2,
        files: [ "file1.txt", "file2.txt", "file3.txt" ]
    });
});
