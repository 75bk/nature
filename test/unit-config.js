var assert = require("assert"),
    Config = require("../lib/config"),
    OptionDefinition = require("../lib/optionDefinition");

describe("Config", function(){
    var _config;
    beforeEach(function(){
        _config = new Config();
    });

    describe("properties:", function(){
        it("isValid should return `true` only if all option values are valid", function(){
            _config.option("one", { type: "number", default: 1 });
            assert.strictEqual(_config.isValid, true);
            _config.option("two", { type: "number", default: -1034.1 });
            assert.strictEqual(_config.isValid, true);
            _config.option("three", { type: "number", default: "Cazzo" });
            assert.strictEqual(_config.isValid, false);
        });
        
        it("`errors` should return an array of errors on invalid values and types", function(){
            _config.option("one", { type: Array, default: 1 });
            _config.option("two", { type: "string", default: 1 });
            _config.option("three", { type: RegExp, default: 1 });
            _config.option("four", { type: "string", default: "clive", valid: /test/ });
            _config.option("five", { type: Array, default: "clive", valid: function (val){ 
                return val.length == 0; 
            }});
            _config.option("six", {type: "number", value: 1 });
            
            assert.ok(_config.errors.length == 5, JSON.stringify(_config.errors));
        });
        
        it("`definitions`");
    });
    
    describe("methods: ", function(){
        it("should toArray()");
        it("should list defined options");
        
        describe("defining options", function(){
            it("option(name, definition) and definition(name) should set and retrieve", function(){
                var definition = { type: "string", default: "one" };
                _config.option("one", definition);
                
                assert.strictEqual(definition.type, _config.definition("one").type);
                assert.strictEqual(definition.default, _config.definition("one").default);
                assert.strictEqual(_config.get("one"), "one");
            });
            
            it("option(existName, definition) should modify existing option definition");
            
            it("define(OptionDefinition) and retrieve with definition(name)", function(){
                var def = new OptionDefinition({ name: "one", "type": "number" });
                _config.define(def);
                
                assert.strictEqual(def, _config.definition("one"));
            });

            it("define(defOptions) and defOption properties match definition(name)", function(){
                function testValid(){}
                _config.define({ name: "one", "type": "number", alias: "o", valid: testValid });
                
                assert.strictEqual(_config.definition("one").type, "number");
                assert.strictEqual(_config.definition("o").type, "number");
                assert.strictEqual(_config.definition("one").alias, "o");
                assert.strictEqual(_config.definition("one").valid, testValid);
            });
            
            describe("incorrect usage,", function(){
                it("option(name, definition) should throw on duplicate option", function(){
                    _config.option("yeah", {});
                
                    assert.throws(function(){
                        _config.option("yeah", { });
                    });
                });
                it("option(name, definition) should throw on duplicate alias", function(){
                    _config.option("one", { alias: "o" });
                    _config.option("two", { alias: "d" });
                    _config.option("three", { alias: "t" });
                
                    assert.throws(function(){
                        _config.option("four", { alias: "t" });
                    });
                });
            });
        });
        
        describe("toJSON()", function(){
            it("should output group toJson()", function(){
                _config.group("testgroup")
                    .option("one", {})
                    .option("two", {})
                    .option("three", {})
                    .set("one", 1)
                    .set("two", 2)
                    .set("three", 3);
            
                assert.deepEqual(
                    _config.group("testgroup").toJSON(),
                    {
                        one: 1,
                        two: 2,
                        three: 3
                    }
                );
            });

            it("should output group and subgroup toJson()", function(){
                _config.group("testgroup")
                    .option("one", {})
                    .set("one", 1)
                    .subgroup("sub")
                        .option("two", {})
                        .option("three", {})
                        .set("two", 2)
                        .set("three", 3);
            
                assert.deepEqual(
                    _config.group("testgroup").toJSON(),
                    {
                        one: 1,
                        two: 2,
                        three: 3
                    }
                );
                assert.deepEqual(
                    _config.group("testgroup").subgroup("sub").toJSON(),
                    {
                        two: 2,
                        three: 3
                    }
                );
            });
        });

        describe("hasValue()", function(){
            it("hasValue() should return true if option has value", function(){
                _config.option("one", {});
                _config.set("one", 1);
            
                assert.strictEqual(_config.hasValue("one"), true);
            
            });

            it("hasValue() should return false if option has no value", function(){
                _config.option("one", {});
            
                assert.strictEqual(_config.hasValue("one"), false);
            });
        });
        
        it("should unset() an option, and its alias", function(){
            _config.option("one", {type: "number", default: 1, alias: "K" });
            assert.strictEqual(_config.get("one"), 1);
            assert.strictEqual(_config.get("K"), 1);
            _config.unset("one");
            assert.strictEqual(_config.get("one"), undefined);            
            assert.strictEqual(_config.get("K"), undefined);
        });
        
        it("should remove() an option and its alias");
        
        describe("set(), get()", function(){
            it("should set() and get() an array", function(){
                _config.option("one", { type: Array });
                _config.set("one", [0, 1]);
                
                assert.deepEqual(_config.get("one"), [0, 1]);
            })
            
            it("should set(option, value) and get(option)", function(){
                _config.option("archiveDirectory", { type: "string", alias: "d" });
                _config.set("archiveDirectory", "testset");

                assert.equal(_config.get("archiveDirectory"), "testset");
            });

            it("should set(alias, value) then get(alias) and get(option)", function(){
                _config.option("archiveDirectory", { type: "string", alias: "d" });
                _config.set("d", "testset");

                assert.strictEqual(_config.get("d"), "testset");
                assert.strictEqual(_config.get("archiveDirectory"), "testset");
            });

            it("should set(option, value) and get(option) within specific group", function(){
                _config.group("veelo").option("archiveDirectory", {type: "string"});
                _config.set("archiveDirectory", "testset2");

                assert.equal(_config.get("archiveDirectory"), "testset2");
            });

            it("should set default option() value", function(){
                _config.option("one", {type: "number", default: 1 });
            
                assert.strictEqual(_config.get("one"), 1);
            });
        
            it("set(optionsHash) should set options in bulk", function(){
                _config.option("one", { type: "number", alias: "1" })
                    .option("two", { type: "number", alias: "t" })
                    .option("three", { type: "number", alias: "3" });
            
                assert.strictEqual(_config.get("one"), undefined);
                assert.strictEqual(_config.get("t"), undefined);
                assert.strictEqual(_config.get("3"), undefined);

                _config.set({
                    one: 1,
                    "t": 2,
                    "3": 3
                });
            
                assert.strictEqual(_config.get("one"), 1);
                assert.strictEqual(_config.get("two"), 2);
                assert.strictEqual(_config.get("three"), 3);
            });

            it("set(configInstance) should set options in bulk", function(){
                _config.option("one", { type: "number", alias: "1" })
                    .option("two", { type: "number", alias: "t" })
                    .option("three", { type: "number", alias: "3" });
            
                assert.strictEqual(_config.get("one"), undefined);
                assert.strictEqual(_config.get("t"), undefined);
                assert.strictEqual(_config.get("3"), undefined);

                var config2 = new Config()
                    .option("one", { type: "number", default: -1 })
                    .option("two", { type: "number", default: -2 })
                    .option("three", { type: "number", default: -3 })

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
            
                assert.strictEqual(_config.get("detailed"), true, JSON.stringify(_config.toJSON2()));
                assert.strictEqual(_config.get("recurse"), true, JSON.stringify(_config.toJSON2()));
                assert.strictEqual(_config.get("preset"), undefined);
                assert.deepEqual(_config.get("files"), ["music", "film", "documentary"]);
            });
            
            // it("set(optionsArray) with a `defaultOption` of type string", function(){
            //     _config.option("one", { type: "string", defaultOption: true });
            //     _config.set(["test"]);
            //     
            //     assert.strictEqual(_config.get("one"), "test");
            // });
            // 
            // it("set(optionsArray) with a `defaultOption` of type number", function(){
            //     _config.option("one", { type: "number", defaultOption: true });
            //     _config.set([1]);
            //     
            //     assert.strictEqual(_config.get("one"), 1);
            // });

            it("set(optionsArray) with a `defaultOption` of type Array", function(){
                _config.option("one", { type: Array, defaultOption: true });
                _config.set(["test", 1, false]);
                
                assert.deepEqual(_config.get("one"), ["test", 1, false]);
            });
            
            describe("incorrect usage,", function(){
                it("set(option, value) should throw on unregistered option", function(){
                    assert.throws(function(){
                        _config.set("yeah", "test");
                    });
                });
                it("get(option) should throw on unregistered option", function(){
                    assert.throws(function(){
                        _config.get("yeah", "test");
                    });
                });
            });
        })

        it("should clone()", function(){
            _config.option("one", { type: "number", default: 1 })
                .option("two", { type: "number", default: 2 });
            
            var config2 = _config.clone();

            assert.notStrictEqual(_config, config2);
            assert.deepEqual(_config.definition("one"), config2.definition("one"), config2);
            assert.deepEqual(_config.definition("two"), config2.definition("two"), config2);
        });
        
        it("options() should return Array of option names");
        
        it("mixin(config)", function(){
            _config.option("year", { type: "number", default: 2013 });
            var config2 = new Config().option("month", { type: "string", default: "feb", alias: "m" });
            var config3 = new Config().option("day", { type: "string", default: "Sunday", alias: "d" })
            
            _config.mixIn(config2);
            _config.mixIn(config3);
            
            assert.strictEqual(_config.get("year"), 2013);
            assert.strictEqual(_config.get("month"), "feb");
            assert.strictEqual(_config.get("day"), "Sunday");
            assert.strictEqual(_config.get("m"), "feb");
            assert.strictEqual(_config.get("d"), "Sunday");
        });

        it("mixin(config, groups)", function(){
            _config.option("year", { type: "number", default: 2013 });
            var config2 = new Config().option("month", { type: "string", default: "feb", alias: "m" });
            var config3 = new Config().option("day", { type: "string", default: "Sunday", alias: "d" })
            
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
            _config.option("one", {type: Array, default: [1,2], required: true, alias: "a" });

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
                    .group2("group1", ["one", "two", "three"]);
                
                // group during define
                _config
                    .define({ name: "four" })
                    .define("group2", [
                        { name: "five", type: "boolean" },
                        { name: "six", type: "string" }
                    ])
                    .define("group3", { name: "title", type: "number"});
                    
                // group during mixin
                var config2 = new Config().define({name: "seven" });
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
                    .group2("everything", ["one", "two", "three"])
                    .group2("everything2", ["one", "two", "three"])
                    .group2("smallest", "one")
                    .group2("not the smallest", ["two", "three"]);
            
                assert.deepEqual(_config.where({ group: "everything" }).toJSON2(), {one: 1, two:2, three:3 });
                assert.deepEqual(_config.where({ group: "everything2" }).toJSON2(), {one: 1, two:2, three:3 });
                assert.deepEqual(_config.where({ group: "smallest" }).toJSON2(), {one: 1 });
                assert.deepEqual(_config.where({ group: "not the smallest" }).toJSON2(), { two:2, three:3 });
            });
            
            it("group(groupName) groups all options", function(){
                _config
                    .define({ name: "one", type: "number", alias: "1", default: 1 })
                    .define({ name: "two", type: "number", alias: "t", default: 2 })
                    .define({ name: "three", type: "number", alias: "3", default: 3 })
                    .group2("everything");
            
                assert.deepEqual(_config.where({ group: "everything" }).toJSON2(), {one: 1, two:2, three:3 });
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
                    .group2("group", ["two", "three"]);
                
                assert.throws(function(){
                    _config.where({ group: "group" }).get("one");
                });
                assert.strictEqual(_config.where({ group: "group" }).get("two"), 2);
                assert.strictEqual(_config.where({ group: "group" }).get("three"), 3);
                assert.strictEqual(_config.get("one"), 1);
                assert.strictEqual(_config.get("two"), 2);
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
