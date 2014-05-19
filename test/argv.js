var test = require("tape");

test("simple", function(t){
    var argv = [ "--verbose", "-c", "red", "file1.txt", "file2.txt", "file3.txt" ];
    expectArgs = [
        { name: "verbose", type: "boolean" },
        { name: "colour", alias: "c" },
        { name: "files", defaultOption: true }
    ];
    t.deepEqual(parse(argv, expectArgs), {
        verbose: true,
        colour: "red",
        files: [ "file1.txt", "file2.txt", "file3.txt" ]
    });
});
