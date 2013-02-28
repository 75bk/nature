var assert = require("assert"),
    _ = require("underscore"),
    configMaster = require("../lib/config-master"),
    Configs = configMaster.Configs,
    Config = configMaster.Config;

var _configs;
beforeEach(function(){
    _configs = new Configs();
});

describe("Configs", function(){
    describe("constructor:", function(){
        it("")
    });
    describe("methods:", function(){
        it("add(name, configInstance) should be chainable, get(configName) should return the added.", function(){
            var config = new Config()
            var output = _configs.add( "test", config );
        
            assert.strictEqual(_configs.get("test"), config);
            assert.strictEqual(output, _configs);
        });
    
        it("add(name, configName) should add a copy of configName", function(){
            var config1 = new Config()
                .group("whatever")
                    .define({ name: "one", default: 1, valid: /[0-9]/, type: "number" });
            var config2 = _configs
                .add("config1", config1 )
                .add("config2", "config1")
                .get("config2");

            assert.deepEqual(_.omit(config1.definition("one"), "config"), _.omit(config2.definition("one"), "config"));
        });

        it("add(name, [configNames]) should add a config with merged copies of configNames", function(){
            var config1 = new Config().define({ name: "one", default: 1, alias: "a" });
            var config2 = new Config().define({ name: "two", default: 2, alias: "b" });
            var config3 = _configs
                .add("config1", config1)
                .add("config2", config2)
                .add("config3", [ "config1", "config2" ])
                .get("config3");

            assert.deepEqual(config3.definition("one"), config1.definition("one"));
            assert.deepEqual(config3.definition("two"), config2.definition("two"));
            assert.deepEqual(config3.toJSON(), { one: 1, two: 2 });
            assert.deepEqual(config3.where({ group: "config1" }).toJSON(), { one: 1 });
            assert.deepEqual(config3.where({ group: "config2" }).toJSON(), { two: 2 });
            assert.deepEqual(config3.get("a"), 1);
            assert.deepEqual(config3.get("b"), 2);
        });
        
        it("any other invocation of add() should throw");
        
        it("get(configName,  options) should return correct config with `options` hash values set", function(){
            var config = new Config()
                .define({ name: "one" })
                .define({ name: "two" });
            _configs.add("config", config);
            
            assert.throws(function(){
                var config2 = _configs.get("config", { one: "uno", two: "due", three: "tre" });
            });
            
            var config2 = _configs.get("config", { one: "uno", two: "due" });
            assert.deepEqual(config2.toJSON(), { one: "uno", two: "due" });
        });


        it("get(configName, configInstance) should return correct config with `options` hash values set", function(){
            var config = new Config()
                .define({ name: "one" })
                .define({ name: "two" });
            _configs.add("config", config);
            
            var config2 = new Config()
                .define({ name: "one", default: -1 })
                .define({ name: "two", default: -2 })
                .define({ name: "three", default: -3 });

            assert.throws(function(){
                _configs.get("config", config2);
            });
            
            config.define({ name: "three" });
            _configs.get("config", config2);
            
            assert.deepEqual(config.toJSON(), { one: -1, two: -2, three: -3 });
        });
        
        it("get(configName, [valueArray]) should return correct config with array values set", function(){
            var config = new Config()
                .define({ name: "one", type: Number, default: -1 })
                .define({ name: "two", type: Number, default: -2 })
                .define({ name: "three", type: Number, default: -3 });
        
            _configs.add("config", config);
        
            var config2 = _configs.get("config", [ "--one", "5", "--two", "10", "--three", "20", "clive" ]);
        
            assert.strictEqual(config, config2);
            assert.deepEqual(config2.toJSON(), {
                one: 5,
                two: 10,
                three: 20
            });
        });
    });

    // //  toConfig()
    // config.group("handbrake").toConfig()
    // 
});
