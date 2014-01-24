var assert = require("assert"),
    _ = require("underscore"),
    Thing = require("../lib/Thing"),
    PropertyDefinition = require("../lib/PropertyDefinition");

it("should toArray()");
it("should list defined properties");
it("should be compatible with --property=value style");
it("passing required:true should test for defaultOption.length > 0")
it("this case should be invalid straight after definition: { type: Array, valueTest: function(a){ return a.length > 0; }}");
it("should throw when a none-existent property is accessed, e.g. console.log(properties.dfkdshl)");
it("free usage on --help");
it("should protect from defining properties with reserved names like clone, toJSON, mixIn etc");

it("should throw on empty property, i.e. 'rename -' or '--'");
it("should expose _errors array on Thing instance API, same as 'validationMessages'");
it("needs consistent error handling.. some errors emit, some throw (like 'renamer -').. should all errors just set valid=false?");

it("should valueTest run on get, so function can refer to other set values in this.config? e.g. if (this.config.regex) then ...");
it("a 'post-set' hook, so setting '**/*.txt' on 'files' can be expanded");
it("scrap constructor to remove need for Thing.call(this)");
it("should emit 'invalid' when thing changes from valid to invalid");

var _thing;
beforeEach(function(){
    _thing = new Thing();
});

describe("Thing API", function(){
    describe("properties:", function(){
        it("valid - should return true only when all property values are valid", function(){
            _thing.define({ name: "one", type: "number", default: 1 });
            assert.strictEqual(_thing.valid, true);
            _thing.define({ name: "two", type: "number", default: -1034.1 });
            assert.strictEqual(_thing.valid, true);
            _thing.define({ name: "three", type: "number", default: "Cazzo" });
            assert.strictEqual(_thing.valid, false);
        });
        
        it("validationMessages - should return an array of msgs", function(){
            _thing.define({ name: "one", type: Array, default: 1 });
            _thing.define({ name: "two", type: "string", default: 1 });
            _thing.define({ name: "three", type: RegExp, default: 1 });
            _thing.define({ name: "four", type: "string", default: "clive", valueTest: /test/ });
            _thing.define({ name: "five", type: Array, default: "clive", valueTest: function (val){ 
                return val.length == 0; 
            }});
            _thing.define({ name: "six",type: "number", value: 1 });
            
            assert.ok(_thing.validationMessages.length == 4, JSON.stringify(_thing.validationMessages));
        });
        
        it("definitions", function(){
            var def1 = new PropertyDefinition({ name: "one", type: Array, default: 1 }),
                def2 = new PropertyDefinition({ name: "two", type: "string", default: 1 }),
                def3 = new PropertyDefinition({ name: "three", type: RegExp, default: 1 });

            _thing.define([ def1, def2, def3 ]);
            
            assert.strictEqual(Object.keys(_thing.definitions).length, 3);
            assert.strictEqual(_thing.definitions.one, def1);
            assert.strictEqual(_thing.definitions.two, def2);
            assert.strictEqual(_thing.definitions.three, def3);
        });
        it("properties", function(){
            _thing.define({ name: "one", type: Array, default: 1 });
            _thing.define({ name: "two", type: "string", default: 1 });
            _thing.define({ name: "three", type: RegExp, default: 1 });

            assert.deepEqual(_thing.properties, [ "one", "two", "three" ]);
        })
    });
    
    describe("methods: ", function(){
        describe("defining properties", function(){
            it("define(definition) and definition(name) should set and retrieve", function(){
                var definition = { name: "one", type: "string", default: "one" };
                _thing.define(definition);
                
                assert.strictEqual(definition.type, _thing.definition("one").type);
                assert.strictEqual(definition.default, _thing.definition("one").default);
                assert.strictEqual(_thing.get("one"), "one");
            });
            
            it("define(existingDefinition) should redefine definition", function(){
                _thing.define({ name: "one", type: "number", alias: "a" });
                assert.strictEqual(_thing.definition("one").type, "number");
                assert.strictEqual(_thing.definition("a").type, "number");
                _thing.define({ name: "one", type: "string", alias: "a" });
                assert.strictEqual(_thing.definition("a").type, "string");
            });
            
            it("define(PropertyDefinition) and retrieve with definition(name)", function(){
                var def = new PropertyDefinition({ name: "one", "type": "number" });
                _thing.define(def);
                
                assert.strictEqual(def, _thing.definition("one"));
            });

            it("definition(name) should return defined properties", function(){
                function testValid(){}
                _thing.define({ name: "one", "type": "number", alias: "o", valueTest: testValid });
                
                assert.strictEqual(_thing.definition("one").type, "number");
                assert.strictEqual(_thing.definition("o").type, "number");
                assert.strictEqual(_thing.definition("one").alias, "o");
                assert.strictEqual(_thing.definition("one").valueTest, testValid);
            });
            
            it("define() should work the same with a `definition.value` as set()");
            
        });
        
        describe("hasValue()", function(){
            it("hasValue(propertyName) should return true if property has value", function(){
                _thing.define({ name: "one" });
                assert.strictEqual(_thing.hasValue("one"), false);

                _thing.set("one", 1);
                assert.strictEqual(_thing.hasValue("one"), true);
            });

            it("hasValue(propertyNameArray) should return true if has at least one value in list", function(){
                _thing.define({ name: "one" })
                    .define({ name: "two" });
                assert.strictEqual(_thing.hasValue(["one", "two"]), false);
                
                _thing.set("one", 1);
                assert.strictEqual(_thing.hasValue(["one", "two"]), true);

                _thing.set("two", 2);
                assert.strictEqual(_thing.hasValue(["one", "two"]), true);
            });
        });
        
        it("should unset() an property, and its alias", function(){
            _thing.define({ name: "one", type: "number", default: 1, alias: "K" });
            assert.strictEqual(_thing.get("one"), 1);
            assert.strictEqual(_thing.get("K"), 1);
            _thing.unset("one");
            assert.strictEqual(_thing.get("one"), undefined);            
            assert.strictEqual(_thing.get("K"), undefined);
        });
        
        it("should remove() an property and its alias");
        
        describe("setting and getting values", function(){
            it("should set(property, value) and get(property) an array", function(){
                _thing.define({ name: "one", type: Array });
                _thing.set("one", [0, 1]);
                
                assert.deepEqual(_thing.get("one"), [0, 1]);
            })
            
            it("should set(property, value) and get(property) a string", function(){
                _thing.define({ name: "test", type: "string", alias: "d" });
                _thing.set("test", "testset");

                assert.strictEqual(_thing.get("test"), "testset");
            });

            it("should set(alias, value) then get(alias) and get(property)", function(){
                _thing.define({ name: "archiveDirectory", type: "string", alias: "d" });
                _thing.set("d", "testset");

                assert.strictEqual(_thing.get("d"), "testset");
                assert.strictEqual(_thing.get("archiveDirectory"), "testset");
            });

            it("should set default property() value", function(){
                _thing.define({ name: "one", type: "number", default: 1 });
            
                assert.strictEqual(_thing.get("one"), 1);
            });

            it("set(propertiesHash) should set properties in bulk", function(){
                _thing.define({ name: "one", type: "number", alias: "1" })
                    .define({ name: "two", type: "number", alias: "t" })
                    .define({ name: "three", type: "number", alias: "3" });
            
                assert.strictEqual(_thing.get("one"), undefined);
                assert.strictEqual(_thing.get("t"), undefined);
                assert.strictEqual(_thing.get("3"), undefined);

                _thing.set({ one: 1, t: 2, 3: 3 });
            
                assert.strictEqual(_thing.get("one"), 1);
                assert.strictEqual(_thing.get("two"), 2);
                assert.strictEqual(_thing.get("three"), 3);
            });

            it("set(configInstance) should set properties in bulk", function(){
                _thing.define({ name: "one", type: "number", alias: "1" })
                    .define({ name: "two", type: "number", alias: "t" })
                    .define({ name: "three", type: "number", alias: "3" });
            
                assert.strictEqual(_thing.get("one"), undefined);
                assert.strictEqual(_thing.get("t"), undefined);
                assert.strictEqual(_thing.get("3"), undefined);

                var config2 = new Thing()
                    .define({ name: "one", type: "number", default: -1 })
                    .define({ name: "two", type: "number", default: -2 })
                    .define({ name: "three", type: "number", default: -3 })

                _thing.set(config2);
            
                assert.strictEqual(_thing.get("one"), -1);
                assert.strictEqual(_thing.get("two"), -2);
                assert.strictEqual(_thing.get("three"), -3);
            
            });
        
            it("set(propertiesArray) should set properties in bulk", function(){
                var argv = ["-d", "--preset", "dope", "--recurse", "music", "film", "documentary"];
                _thing
                    .define({ name: "detailed", alias: "d", type: "boolean" })
                    .define({ name: "recurse", type: "boolean" })
                    .define({ name: "preset", type: "string" })
                    .define({ name: "files", type: Array, defaultOption: true })
                    .set(argv);
            
                assert.strictEqual(_thing.get("detailed"), true, JSON.stringify(_thing.toJSON()));
                assert.strictEqual(_thing.get("recurse"), true, JSON.stringify(_thing.toJSON()));
                assert.strictEqual(_thing.get("preset"), "dope");
                assert.deepEqual(_thing.get("files"), ["music", "film", "documentary"]);
            });
            
            it("set(process.argv) should set properties in bulk", function(){
                process.argv = ["node", "test.js", "-d", "--preset", "dope", "--recurse", "music", "film", "documentary"];
                _thing
                    .define({ name: "detailed", alias: "d", type: "boolean" })
                    .define({ name: "recurse", type: "boolean" })
                    .define({ name: "preset", type: "string" })
                    .define({ name: "files", type: Array, defaultOption: true })
                    .set(process.argv);

                assert.strictEqual(_thing.get("detailed"), true, JSON.stringify(_thing.toJSON()));
                assert.strictEqual(_thing.get("recurse"), true, JSON.stringify(_thing.toJSON()));
                assert.strictEqual(_thing.get("preset"), "dope");
                assert.deepEqual(_thing.get("files"), ["music", "film", "documentary"]);
            });

            it("set(process.argv) should set correct defaults", function(){
                process.argv = [ 
                    "/usr/local/bin/node", "/usr/local/bin/rename", "file1.test","file2.test", 
                    "file3.test", "file4.test", "file5.test", 
                    "-d", "-r" 
                ];
                _thing
                    .define({ 
                        name: "files",
                        type: Array,
                        required: true,
                        defaultOption: true,
                        default: []
                    })
                    .define({ name: "find", type: "string", alias: "f" })
                    .define({ name: "make", type: "string", alias: "m", default: "pie" })
                    .define({ name: "num", type: "number" })
                    .define({ name: "num2", type: "number", default: 10 })
                    .define({ name: "replace", type: "string", alias: "r", default: "" })
                    .define({ name: "dry-run", type: "boolean", alias: "d" })
                    .set(process.argv);
            
                assert.strictEqual(_thing.make, "pie", JSON.stringify(_thing.toJSON()));
                assert.strictEqual(_thing.replace, "", JSON.stringify(_thing.toJSON()));
                assert.strictEqual(_thing.num, undefined, JSON.stringify(_thing.toJSON()));
                assert.strictEqual(_thing.num2, 10, JSON.stringify(_thing.toJSON()));
                assert.strictEqual(_thing["dry-run"], true, JSON.stringify(_thing.toJSON()));
                assert.deepEqual(_thing.files, ["file1.test", "file2.test", "file3.test", "file4.test", "file5.test"]);
            });
            
            it("set(propertiesArray) with a type Array", function(){
                _thing.define({ name:"one", type: Array });

                _thing.set(["--one", "test", 1, false]);
                assert.deepEqual(_thing.get("one"), ["test"]);

                _thing.set(["--one", "test ,1    , false"]);
                assert.deepEqual(_thing.get("one"), ["test", "1", "false"]);
            });
            
            it("set(['--property', '--value']) should set correctly, where 'property' expects a value", function(){
                _thing.define({ name: "one", type: "string" });
                _thing.set([ "--one", "--23" ]);
                assert.deepEqual(_thing.one, "--23");
                _thing.set([ "--one", "" ]);
                assert.deepEqual(_thing.one, "");
            });

            it("set(propertiesArray) with a `defaultOption` of type Array", function(){
                _thing.define({ name: "one", type: Array, defaultOption: true });
                _thing.set(["test", 1, false]);
                
                assert.deepEqual(_thing.get("one"), ["test", 1, false]);
            });

            it("set(propertiesArray) with a `defaultOption` of type 'string'", function(){
                _thing.define({ name: "one", type: "string", defaultOption: true });
                _thing.set(["test", 1, false]);
                
                assert.strictEqual(_thing.get("one"), "test");
            });

            it("set(propertiesArray) with a `defaultOption` of type number", function(){
                _thing.define({ name: "one", type: "number", defaultOption: true });
                _thing.set([1, 4, 5]);
                
                assert.strictEqual(_thing.get("one"), 1);
            });
            
            it("warn if set(propertiesArray) produces defaultValues with no defaultOption set");
        })

        it("should clone()", function(){
            _thing.define({ name: "one", type: "number", default: 1 })
                .define({ name: "two", type: "number", default: 2 });
            
            var config2 = _thing.clone();
            assert.notStrictEqual(_thing, config2);
            assert.deepEqual(_.omit(_thing.definition("one"), "config"), _.omit(config2.definition("one"), "config"));
            assert.deepEqual(_.omit(_thing.definition("two"), "config"), _.omit(config2.definition("two"), "config"));
        });
        
        it("properties() should return Array of property names");
        
        it("mixin(config)", function(){
            _thing.define({ name: "year", type: "number", default: 2013 });
            var config2 = new Thing().define({ name: "month", type: "string", default: "feb", alias: "m" });
            var config3 = new Thing().define({ name: "day", type: "string", default: "Sunday", alias: "d" })
            
            _thing.mixIn(config2);
            _thing.mixIn(config3);
            
            assert.strictEqual(_thing.get("year"), 2013);
            assert.strictEqual(_thing.get("month"), "feb");
            assert.strictEqual(_thing.get("day"), "Sunday");
            assert.strictEqual(_thing.get("m"), "feb");
            assert.strictEqual(_thing.get("d"), "Sunday");
        });
        
        it("mixin() must fail on duplicate propertyName or alias");

        it("mixin(config, groups)", function(){
            _thing.define({ name: "year", type: "number", default: 2013 });
            var config2 = new Thing().define({ name: "month", type: "string", default: "feb", alias: "m" });
            var config3 = new Thing().define({ name: "day", type: "string", default: "Sunday", alias: "d" })
            
            _thing.mixIn(config2, "config2");
            _thing.mixIn(config3, ["config2", "config3"]);
            
            assert.strictEqual(_thing.get("year"), 2013);
            assert.deepEqual(_thing.definition("year").groups, []);
            assert.strictEqual(_thing.get("month"), "feb");
            assert.deepEqual(_thing.definition("month").groups, ["config2"]);
            assert.strictEqual(_thing.get("day"), "Sunday");
            assert.deepEqual(_thing.definition("day").groups, ["config2", "config3"]);
        });
        
        it("definition(property) should return correct def for full name and alias", function(){
            _thing.define({ name: "one", type: Array, default: [1,2], required: true, alias: "a" });

            assert.strictEqual(_thing.definition("one").type, Array);
            assert.strictEqual(_thing.definition("a").type, Array);
            assert.deepEqual(_thing.definition("one").default, [1,2]);
            assert.deepEqual(_thing.definition("a").default, [1,2]);
            assert.strictEqual(_thing.definition("one").required, true);
            assert.strictEqual(_thing.definition("a").required, true);
            assert.strictEqual(_thing.definition("one").alias, "a");
            assert.strictEqual(_thing.definition("a").alias, "a");
        });
        
        describe("grouping", function(){
            it("grouping summary", function(){
                // set group after defining
                _thing
                    .define({ name: "one", type: "number" })
                    .define({ name: "two", type: "number" })
                    .define({ name: "three", type: "number" })
                    .group("group1", ["one", "two", "three"]);
                
                // group during define
                _thing
                    .define({ name: "four" })
                    .define("group2", [
                        { name: "five", type: "boolean" },
                        { name: "six", type: "string" }
                    ])
                    .define("group3", { name: "title", type: "number"});
                    
                // group during mixin
                var config2 = new Thing().define({ name: "seven" });
                _thing.mixIn(config2, "group4");
                
                // ungroup specific properties
                _thing.ungroup("group1", ["one", "two"]);
                
                // ungroup all
                _thing.ungroup("group2");
                
                // retrieve group
                _thing.where({ group: "group3" }).toJSON();
            });
            
            it("group(groupName, propertyNameArray)", function(){
                _thing
                    .define({ name: "one", type: "number", alias: "1", default: 1 })
                    .define({ name: "two", type: "number", alias: "t", default: 2 })
                    .define({ name: "three", type: "number", alias: "3", default: 3 })
                    .group("everything", ["one", "two", "three"])
                    .group("everything2", ["one", "two", "three"])
                    .group("smallest", "one")
                    .group("not the smallest", ["two", "three"]);
            
                assert.deepEqual(_thing.where({ group: "everything" }).toJSON(), {one: 1, two:2, three:3 });
                assert.deepEqual(_thing.where({ group: "everything2" }).toJSON(), {one: 1, two:2, three:3 });
                assert.deepEqual(_thing.where({ group: "smallest" }).toJSON(), {one: 1 });
                assert.deepEqual(_thing.where({ group: "not the smallest" }).toJSON(), { two:2, three:3 });
            });
            
            it("group(groupName) groups all properties", function(){
                _thing
                    .define({ name: "one", type: "number", alias: "1", default: 1 })
                    .define({ name: "two", type: "number", alias: "t", default: 2 })
                    .define({ name: "three", type: "number", alias: "3", default: 3 })
                    .group("everything");
            
                assert.deepEqual(_thing.where({ group: "everything" }).toJSON(), {one: 1, two:2, three:3 });
            })
            
            it("ungroup(groupName) should remove all properties from groupName", function(){
                _thing
                    .define("group1", {name: "one"})
                    .define("group1", {name: "two"})
                    .define("group2", {name: "three"});
                assert.deepEqual(_thing.where({ group: "group1"}).properties, ["one", "two"]);
                
                _thing.ungroup("group1");
                assert.deepEqual(_thing.where({ group: "group1"}).properties, []);
                
            });

            it("ungroup(groupName, propertyNameArray) should remove propertyNames from groupName", function(){
                _thing
                    .define("group1", {name: "one"})
                    .define("group1", {name: "two"})
                    .define("group2", {name: "three"})
                    .define("group1", {name: "four"});
                assert.deepEqual(_thing.where({ group: "group1"}).properties, ["one", "two", "four"]);
                
                _thing.ungroup("group1", "one");
                assert.deepEqual(_thing.where({ group: "group1"}).properties, ["two", "four"]);

                _thing.ungroup("group1", ["two", "four"]);
                assert.deepEqual(_thing.where({ group: "group1"}).properties, []);
            });
            
            it("where({group: groupName}) returns a Thing clone, with reduced properties", function(){
                _thing
                    .define({ name: "one", type: "number", alias: "1", default: 1 })
                    .define({ name: "two", type: "number", alias: "t", default: 2 })
                    .define({ name: "three", type: "number", alias: "3", default: 3 })
                    .group("group", ["two", "three"]);
                
                assert.strictEqual(_thing.where({ group: "group" }).get("one"), undefined);
                assert.strictEqual(_thing.where({ group: "group" }).get("two"), 2);
                assert.strictEqual(_thing.where({ group: "group" }).get("three"), 3);
                assert.strictEqual(_thing.get("one"), 1);
                assert.strictEqual(_thing.get("two"), 2);
                assert.strictEqual(_thing.get("three"), 3);
            });
            
            it("where({ name: {$ne: []}}) should exclude named properties", function(){
                _thing
                    .define({ name: "one", type: "number", alias: "1", default: 1 })
                    .define({ name: "two", type: "number", alias: "t", default: 2 })
                    .define({ name: "three", type: "number", alias: "3", default: 3 });
                    
                assert.throws(function(){
                    assert.strictEqual(_thing.where({ name: { $ne: ["one", "two"] }}).get("one"), 1);
                }, null, JSON.stringify(_thing.where({ name: { $ne: ["one", "two"] }}).toJSON()));
                assert.throws(function(){
                    assert.strictEqual(_thing.where({ name: { $ne: ["one", "two"] }}).get("two"), 2);
                });
                assert.strictEqual(_thing.get("three"), 3);
            });
            
            it("define() with groups and subgroups");
            
            it("define(groupName, definitionArray) with groups", function(){
                _thing
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
               
                assert.deepEqual(_thing.definition("no group").groups, []);
                assert.deepEqual(_thing.definition("title").groups, ["source"], JSON.stringify(_thing.definition("title")));
                assert.deepEqual(_thing.definition("start-at").groups, ["source"]);
                assert.deepEqual(_thing.definition("stop-at").groups, ["source"]);
            });
            
        });
    });
});

describe("Error handling", function(){
    it("define(definition) should not throw on duplicate property", function(){
        _thing.define({ name: "yeah", type: "string" });
    
        assert.doesNotThrow(function(){
            _thing.define({ name: "yeah", type: "boolean" });
        });
        assert.strictEqual(_thing.definition("yeah").type, "boolean");
    });
    it("define(definition) should throw on duplicate alias", function(){
        _thing.define({ name: "three", alias: "t" });
    
        assert.throws(function(){
            _thing.define({ name: "four", alias: "t" });
        });
    });
    it("set(property, value) should emit 'error' on unregistered property", function(){
        assert.throws(function(){
            _thing.set("yeah", "test");
        });
        assert.strictEqual(_thing.valid, false);
        assert.strictEqual(_thing._errors.length, 1);                    
    });
    
    it("catching 'error' surpresses throw on bad set()", function(){
        _thing.on("error", function(err){
            assert.ok(err);
        });
        assert.doesNotThrow(function(){
            _thing.set("yeah", "test");
        });
        assert.strictEqual(_thing.valid, false);
        assert.strictEqual(_thing._errors.length, 1);                    
    });

    it("set([--property, value]) should emit 'error' on unregistered property", function(){
        assert.throws(function(){
            _thing.set(["--asdklfjlkd"]);
        });
        assert.strictEqual(_thing.valid, false);
        assert.strictEqual(_thing._errors.length, 1);                    
    });
                    
    it("get(property) should return undefined on unregistered property", function(){
        assert.strictEqual(_thing.get("yeah", "test"), undefined);
    });
    
    it("set(propertiesArray) should not alter propertiesArray itself", function(){
        var args = [ "--one", 1, "--two", 2, "--three", 3 ];
        _thing
            .define({ name: "one", type: "number", default: -1 })
            .define({ name: "two", type: "number", default: -2 })
            .define({ name: "three", type: "number", default: -3 });
        
        assert.deepEqual(args, [ "--one", 1, "--two", 2, "--three", 3 ]);
        _thing.set(args);
        assert.deepEqual(args, [ "--one", 1, "--two", 2, "--three", 3 ]);
    });
});
