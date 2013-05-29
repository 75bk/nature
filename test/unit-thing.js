var assert = require("assert"),
    _ = require("underscore"),
    Thing = require("../lib/thing"),
    PropertyDefinition = require("../lib/propertyDefinition");

it("should toArray()");
it("should list defined options");
it("should copyTo(this), copy its properties to passed in object");
it("should loadCliArgs()");
it("should `process.argv.splice(0, 2);` for you");
it("set(['--option', '---']) should set '---' on `option`");
it("should be compatible with --option=value style");
it("add(Thing) should add the Thing, not create a new one");

describe("Thing", function(){
    var _config;
    beforeEach(function(){
        _config = new Thing();
    });

    describe("properties:", function(){
        it("`valid` should return `true` only when all option values are valid", function(){
            _config.define({ name: "one", type: "number", default: 1 });
            assert.strictEqual(_config.valid, true);
            _config.define({ name: "two", type: "number", default: -1034.1 });
            assert.strictEqual(_config.valid, true);
            _config.define({ name: "three", type: "number", default: "Cazzo" });
            assert.strictEqual(_config.valid, false);
        });
        
        it("`errors` should return an array of errors on invalid values and types", function(){
            _config.define({ name: "one", type: Array, default: 1 });
            _config.define({ name: "two", type: "string", default: 1 });
            _config.define({ name: "three", type: RegExp, default: 1 });
            _config.define({ name: "four", type: "string", default: "clive", valueTest: /test/ });
            _config.define({ name: "five", type: Array, default: "clive", valueTest: function (val){ 
                return val.length == 0; 
            }});
            _config.define({ name: "six",type: "number", value: 1 });
            
            assert.ok(_config.errors.length == 4, JSON.stringify(_config.errors));
        });
        
        it("`definitions`", function(){
            var def1 = new PropertyDefinition({ name: "one", type: Array, default: 1 }),
                def2 = new PropertyDefinition({ name: "two", type: "string", default: 1 }),
                def3 = new PropertyDefinition({ name: "three", type: RegExp, default: 1 });

            _config.define([ def1, def2, def3 ]);
            
            assert.strictEqual(Object.keys(_config.definitions).length, 3);
            assert.strictEqual(_config.definitions.one, def1);
            assert.strictEqual(_config.definitions.two, def2);
            assert.strictEqual(_config.definitions.three, def3);
        });
        it("`options`", function(){
            _config.define({ name: "one", type: Array, default: 1 });
            _config.define({ name: "two", type: "string", default: 1 });
            _config.define({ name: "three", type: RegExp, default: 1 });

            assert.deepEqual(_config.options, [ "one", "two", "three" ]);
        })
    });
    
    describe("methods: ", function(){
        describe("defining options", function(){
            it("define(definition) and definition(name) should set and retrieve", function(){
                var definition = { name: "one", type: "string", default: "one" };
                _config.define(definition);
                
                assert.strictEqual(definition.type, _config.definition("one").type);
                assert.strictEqual(definition.default, _config.definition("one").default);
                assert.strictEqual(_config.get("one"), "one");
            });
            
            it("define(existingDefinition) should modify existing option definition");
            
            it("define(PropertyDefinition) and retrieve with definition(name)", function(){
                var def = new PropertyDefinition({ name: "one", "type": "number" });
                _config.define(def);
                
                assert.strictEqual(def, _config.definition("one"));
            });

            it("definition(name) should return defined properties", function(){
                function testValid(){}
                _config.define({ name: "one", "type": "number", alias: "o", valueTest: testValid });
                
                assert.strictEqual(_config.definition("one").type, "number");
                assert.strictEqual(_config.definition("o").type, "number");
                assert.strictEqual(_config.definition("one").alias, "o");
                assert.strictEqual(_config.definition("one").valueTest, testValid);
            });
            
            it("define() should work the same with a `definition.value` as set()");
            
            describe("incorrect usage,", function(){
                it("define(definition) should throw on duplicate option", function(){
                    _config.define({ name: "yeah" });
                
                    assert.throws(function(){
                        _config.define({ name: "yeah", });
                    });
                });
                it("define(definition) should throw on duplicate alias", function(){
                    _config.define({ name: "one", alias: "o" });
                    _config.define({ name: "two", alias: "d" });
                    _config.define({ name: "three", alias: "t" });
                
                    assert.throws(function(){
                        _config.define({ name: "four", alias: "t" });
                    });
                });
            });
        });
        
        describe("hasValue()", function(){
            it("hasValue(optionName) should return true if option has value", function(){
                _config.define({ name: "one" });
                assert.strictEqual(_config.hasValue("one"), false);

                _config.set("one", 1);
                assert.strictEqual(_config.hasValue("one"), true);
            });

            it("hasValue(optionNameArray) should return true if has at least one value in list", function(){
                _config.define({ name: "one" })
                    .define({ name: "two" });
                assert.strictEqual(_config.hasValue(["one", "two"]), false);
                
                _config.set("one", 1);
                assert.strictEqual(_config.hasValue(["one", "two"]), true);

                _config.set("two", 2);
                assert.strictEqual(_config.hasValue(["one", "two"]), true);
            });
        });
        
        it("should unset() an option, and its alias", function(){
            _config.define({ name: "one", type: "number", default: 1, alias: "K" });
            assert.strictEqual(_config.get("one"), 1);
            assert.strictEqual(_config.get("K"), 1);
            _config.unset("one");
            assert.strictEqual(_config.get("one"), undefined);            
            assert.strictEqual(_config.get("K"), undefined);
        });
        
        it("should remove() an option and its alias");
        
        describe("set(), get()", function(){
            it("should set() and get() an array", function(){
                _config.define({ name: "one", type: Array });
                _config.set("one", [0, 1]);
                
                assert.deepEqual(_config.get("one"), [0, 1]);
            })
            
            it("should set(option, value) and get(option)", function(){
                _config.define({ name: "archiveDirectory", type: "string", alias: "d" });
                _config.set("archiveDirectory", "testset");

                assert.strictEqual(_config.get("archiveDirectory"), "testset");
            });

            it("should set(alias, value) then get(alias) and get(option)", function(){
                _config.define({ name: "archiveDirectory", type: "string", alias: "d" });
                _config.set("d", "testset");

                assert.strictEqual(_config.get("d"), "testset");
                assert.strictEqual(_config.get("archiveDirectory"), "testset");
            });

            it("should set default option() value", function(){
                _config.define({ name: "one", type: "number", default: 1 });
            
                assert.strictEqual(_config.get("one"), 1);
            });
        
            it("set(optionsHash) should set options in bulk", function(){
                _config.define({ name: "one", type: "number", alias: "1" })
                    .define({ name: "two", type: "number", alias: "t" })
                    .define({ name: "three", type: "number", alias: "3" });
            
                assert.strictEqual(_config.get("one"), undefined);
                assert.strictEqual(_config.get("t"), undefined);
                assert.strictEqual(_config.get("3"), undefined);

                _config.set({ one: 1, t: 2, 3: 3 });
            
                assert.strictEqual(_config.get("one"), 1);
                assert.strictEqual(_config.get("two"), 2);
                assert.strictEqual(_config.get("three"), 3);
            });

            it("set(configInstance) should set options in bulk", function(){
                _config.define({ name: "one", type: "number", alias: "1" })
                    .define({ name: "two", type: "number", alias: "t" })
                    .define({ name: "three", type: "number", alias: "3" });
            
                assert.strictEqual(_config.get("one"), undefined);
                assert.strictEqual(_config.get("t"), undefined);
                assert.strictEqual(_config.get("3"), undefined);

                var config2 = new Thing()
                    .define({ name: "one", type: "number", default: -1 })
                    .define({ name: "two", type: "number", default: -2 })
                    .define({ name: "three", type: "number", default: -3 })

                _config.set(config2);
            
                assert.strictEqual(_config.get("one"), -1);
                assert.strictEqual(_config.get("two"), -2);
                assert.strictEqual(_config.get("three"), -3);
            
            });
        
            it("set(optionsArray) should set options in bulk", function(){
                var argv = ["node", "test.js", "info", "-d", "--preset", "--recurse", "music", "film", "documentary"];
                argv.splice(0, 2);
                var command = argv.shift();
                _config
                    .define({ name: "detailed", alias: "d", type: "boolean" })
                    .define({ name: "recurse", type: "boolean" })
                    .define({ name: "preset", type: "string" })
                    .define({ name: "files", type: Array, defaultOption: true });
            
                _config.set(argv);
            
                assert.strictEqual(_config.get("detailed"), true, JSON.stringify(_config.toJSON()));
                assert.strictEqual(_config.get("recurse"), true, JSON.stringify(_config.toJSON()));
                assert.strictEqual(_config.get("preset"), undefined);
                assert.deepEqual(_config.get("files"), ["music", "film", "documentary"]);
            });
            
            it("set(optionsArray) with a type Array", function(){
                _config.define({ name:"one", type: Array });

                _config.set(["--one", "test", 1, false]);
                assert.deepEqual(_config.get("one"), ["test"]);

                _config.set(["--one", "test ,1    , false"]);
                assert.deepEqual(_config.get("one"), ["test", "1", "false"]);
            });

            it("set(optionsArray) with a `defaultOption` of type Array", function(){
                _config.define({ name: "one", type: Array, defaultOption: true });
                _config.set(["test", 1, false]);
                
                assert.deepEqual(_config.get("one"), ["test", 1, false]);
            });

            it("set(optionsArray) with a `defaultOption` of type 'string'", function(){
                _config.define({ name: "one", type: "string", defaultOption: true });
                _config.set(["test", 1, false]);
                
                assert.strictEqual(_config.get("one"), "test");
            });

            it("set(optionsArray) with a `defaultOption` of type number", function(){
                _config.define({ name: "one", type: "number", defaultOption: true });
                _config.set([1, 4, 5]);
                
                assert.strictEqual(_config.get("one"), 1);
            });
            
            it("warn if set(optionsArray) produces defaultValues with no defaultOption set");

            describe("incorrect usage,", function(){
                it("set(option, value) should throw on unregistered option", function(){
                    assert.throws(function(){
                        _config.set("yeah", "test");
                    });
                });
                
                it("set(option, value) should emit error on unregistered option");
                
                it("get(option) should throw on unregistered option", function(){
                    assert.throws(function(){
                        _config.get("yeah", "test");
                    });
                });
            });
        })

        it("should clone()", function(){
            _config.define({ name: "one", type: "number", default: 1 })
                .define({ name: "two", type: "number", default: 2 });
            
            var config2 = _config.clone();
            assert.notStrictEqual(_config, config2);
            assert.deepEqual(_.omit(_config.definition("one"), "config"), _.omit(config2.definition("one"), "config"));
            assert.deepEqual(_.omit(_config.definition("two"), "config"), _.omit(config2.definition("two"), "config"));
        });
        
        it("options() should return Array of option names");
        
        it("mixin(config)", function(){
            _config.define({ name: "year", type: "number", default: 2013 });
            var config2 = new Thing().define({ name: "month", type: "string", default: "feb", alias: "m" });
            var config3 = new Thing().define({ name: "day", type: "string", default: "Sunday", alias: "d" })
            
            _config.mixIn(config2);
            _config.mixIn(config3);
            
            assert.strictEqual(_config.get("year"), 2013);
            assert.strictEqual(_config.get("month"), "feb");
            assert.strictEqual(_config.get("day"), "Sunday");
            assert.strictEqual(_config.get("m"), "feb");
            assert.strictEqual(_config.get("d"), "Sunday");
        });
        
        it("mixin() must fail on duplicate optionName or alias");

        it("mixin(config, groups)", function(){
            _config.define({ name: "year", type: "number", default: 2013 });
            var config2 = new Thing().define({ name: "month", type: "string", default: "feb", alias: "m" });
            var config3 = new Thing().define({ name: "day", type: "string", default: "Sunday", alias: "d" })
            
            _config.mixIn(config2, "config2");
            _config.mixIn(config3, ["config2", "config3"]);
            
            assert.strictEqual(_config.get("year"), 2013);
            assert.deepEqual(_config.definition("year").groups, []);
            assert.strictEqual(_config.get("month"), "feb");
            assert.deepEqual(_config.definition("month").groups, ["config2"]);
            assert.strictEqual(_config.get("day"), "Sunday");
            assert.deepEqual(_config.definition("day").groups, ["config2", "config3"]);
        });
        
        it("definition(option) should return correct def for full name and alias", function(){
            _config.define({ name: "one", type: Array, default: [1,2], required: true, alias: "a" });

            assert.strictEqual(_config.definition("one").type, Array);
            assert.strictEqual(_config.definition("a").type, Array);
            assert.deepEqual(_config.definition("one").default, [1,2]);
            assert.deepEqual(_config.definition("a").default, [1,2]);
            assert.strictEqual(_config.definition("one").required, true);
            assert.strictEqual(_config.definition("a").required, true);
            assert.strictEqual(_config.definition("one").alias, "a");
            assert.strictEqual(_config.definition("a").alias, "a");
        });
        
        describe("grouping", function(){
            it("grouping summary", function(){
                // set group after defining
                _config
                    .define({ name: "one", type: "number" })
                    .define({ name: "two", type: "number" })
                    .define({ name: "three", type: "number" })
                    .group("group1", ["one", "two", "three"]);
                
                // group during define
                _config
                    .define({ name: "four" })
                    .define("group2", [
                        { name: "five", type: "boolean" },
                        { name: "six", type: "string" }
                    ])
                    .define("group3", { name: "title", type: "number"});
                    
                // group during mixin
                var config2 = new Thing().define({ name: "seven" });
                _config.mixIn(config2, "group4");
                
                // ungroup specific options
                _config.ungroup("group1", ["one", "two"]);
                
                // ungroup all
                _config.ungroup("group2");
                
                // retrieve group
                _config.where({ group: "group3" }).toJSON();
            });
            
            it("group(groupName, optionNameArray)", function(){
                _config
                    .define({ name: "one", type: "number", alias: "1", default: 1 })
                    .define({ name: "two", type: "number", alias: "t", default: 2 })
                    .define({ name: "three", type: "number", alias: "3", default: 3 })
                    .group("everything", ["one", "two", "three"])
                    .group("everything2", ["one", "two", "three"])
                    .group("smallest", "one")
                    .group("not the smallest", ["two", "three"]);
            
                assert.deepEqual(_config.where({ group: "everything" }).toJSON(), {one: 1, two:2, three:3 });
                assert.deepEqual(_config.where({ group: "everything2" }).toJSON(), {one: 1, two:2, three:3 });
                assert.deepEqual(_config.where({ group: "smallest" }).toJSON(), {one: 1 });
                assert.deepEqual(_config.where({ group: "not the smallest" }).toJSON(), { two:2, three:3 });
            });
            
            it("group(groupName) groups all options", function(){
                _config
                    .define({ name: "one", type: "number", alias: "1", default: 1 })
                    .define({ name: "two", type: "number", alias: "t", default: 2 })
                    .define({ name: "three", type: "number", alias: "3", default: 3 })
                    .group("everything");
            
                assert.deepEqual(_config.where({ group: "everything" }).toJSON(), {one: 1, two:2, three:3 });
            })
            
            it("ungroup(groupName) should remove all options from groupName", function(){
                _config
                    .define("group1", {name: "one"})
                    .define("group1", {name: "two"})
                    .define("group2", {name: "three"});
                assert.deepEqual(_config.where({ group: "group1"}).options, ["one", "two"]);
                
                _config.ungroup("group1");
                assert.deepEqual(_config.where({ group: "group1"}).options, []);
                
            });

            it("ungroup(groupName, optionNameArray) should remove optionNames from groupName", function(){
                _config
                    .define("group1", {name: "one"})
                    .define("group1", {name: "two"})
                    .define("group2", {name: "three"})
                    .define("group1", {name: "four"});
                assert.deepEqual(_config.where({ group: "group1"}).options, ["one", "two", "four"]);
                
                _config.ungroup("group1", "one");
                assert.deepEqual(_config.where({ group: "group1"}).options, ["two", "four"]);

                _config.ungroup("group1", ["two", "four"]);
                assert.deepEqual(_config.where({ group: "group1"}).options, []);
            });
            
            it("where({group: groupName}) returns a config clone, with reduced options", function(){
                _config
                    .define({ name: "one", type: "number", alias: "1", default: 1 })
                    .define({ name: "two", type: "number", alias: "t", default: 2 })
                    .define({ name: "three", type: "number", alias: "3", default: 3 })
                    .group("group", ["two", "three"]);
                
                assert.throws(function(){
                    _config.where({ group: "group" }).get("one");
                });
                assert.strictEqual(_config.where({ group: "group" }).get("two"), 2);
                assert.strictEqual(_config.where({ group: "group" }).get("three"), 3);
                assert.strictEqual(_config.get("one"), 1);
                assert.strictEqual(_config.get("two"), 2);
                assert.strictEqual(_config.get("three"), 3);
            });
            
            it("where({ name: {$ne: []}}) should exclude named options", function(){
                _config
                    .define({ name: "one", type: "number", alias: "1", default: 1 })
                    .define({ name: "two", type: "number", alias: "t", default: 2 })
                    .define({ name: "three", type: "number", alias: "3", default: 3 });
                    
                assert.throws(function(){
                    assert.strictEqual(_config.where({ name: { $ne: ["one", "two"] }}).get("one"), 1);
                }, null, JSON.stringify(_config.where({ name: { $ne: ["one", "two"] }}).toJSON()));
                assert.throws(function(){
                    assert.strictEqual(_config.where({ name: { $ne: ["one", "two"] }}).get("two"), 2);
                });
                assert.strictEqual(_config.get("three"), 3);
            });
            
            it("define() with groups and subgroups");
            
            it("define(groupName, definitionArray) with groups", function(){
                _config
                    .define({ name: "no group" })
                    .define("general", [
                        { name: "help", type: "boolean", alias: "h" },
                        { name: "input", type: "string", alias: "i" },
                        { name: "output", type: "string", alias: "o" }
                    ])
                    .define("source", [
                        {
                            name: "title",
                            type: "number",
                            alias: "t"
                        },
                        {
                            name: "start-at", 
                            type: "string", 
                            valid: /duration|frame|pts/, 
                            invalidMsg: "please specify the unit, e.g. --start-at duration:10 or --start-at frame:2000"
                        },
                        {
                            name: "stop-at",
                            type: "string",
                            valid: /duration|frame|pts/,
                            invalidMsg: "please specify the unit, e.g. --stop-at duration:100 or --stop-at frame:3000" 
                        }
                    ]);
               
                assert.deepEqual(_config.definition("no group").groups, []);
                assert.deepEqual(_config.definition("title").groups, ["source"], JSON.stringify(_config.definition("title")));
                assert.deepEqual(_config.definition("start-at").groups, ["source"]);
                assert.deepEqual(_config.definition("stop-at").groups, ["source"]);
            });
            
        });
    });
});
