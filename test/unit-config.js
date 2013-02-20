var assert = require("assert"),
    Config = require("../lib/config");

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
            
            assert.ok(_config.errors.length == 5, JSON.stringify(_config.errors));
        });
    });
    
    describe("methods: ", function(){
        it("should toArray()");
        it("should list defined options");
        
        describe("option()", function(){
            it("option(name, definition) and definition(name) should set and retrieve", function(){
                var definition = { type: "string", default: "one" };
                _config.option("one", definition);
                
                assert.strictEqual(definition.type, _config.definition("one").type);
                assert.strictEqual(definition.default, _config.definition("one").default);
                assert.strictEqual(_config.get("one"), "one");
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
        
        describe("set(), get()", function(){
            it("should set() and get() an array", function(){
                _config.option("one", { });
                _config.set("one")
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
                var argv = ["node", "test.js", "info", "-d", "--recurse", "music", "film", "documentary"];
                argv.splice(0, 2);
                var command = argv.shift();
                _config
                    .option("detailed", { alias: "d", type: "boolean" })
                    .option("recurse", { type: "boolean" })
                    .option("files", { array: true, type: "object", defaultOption: true });
            
                _config.set(argv);
            
                assert.strictEqual(_config.get("detailed"), true);
                assert.strictEqual(_config.get("recurse"), true);
                assert.deepEqual(_config.get("files"), ["music", "film", "documentary"]);
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
        
        it("mixin(config) should work", function(){
            _config.option("year", { type: "number", default: 2013 });
            var config2 = new Config().option("month", { type: "string", default: "feb" });
            var config3 = new Config().option("day", { type: "string", default: "Sunday" })
            
            _config.mixIn(config2);
            _config.mixIn(config3);
            
            assert.strictEqual(_config.get("year"), 2013);
            assert.strictEqual(_config.get("month"), "feb");
            assert.strictEqual(_config.get("day"), "Sunday");
        });
    });
});
