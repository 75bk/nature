var assert = require("assert"),
    definition = require("../lib/optionDefinition");

describe("OptionDefinition", function(){
    it("`validType` should return false if no type specified", function(){
        var def = new definition({  });
        assert.strictEqual(def.validType, false);
    });
    
    it("`validType` should return true when `typeof value === type`", function(){
        var def = new definition({ type: "string" });
        assert.strictEqual(def.validType, false);
        def.value = 123;
        assert.strictEqual(def.validType, false);
        def.value = true;
        assert.strictEqual(def.validType, false);
        def.value = "test";
        assert.strictEqual(def.validType, true);
        def.value = function(){};
        assert.strictEqual(def.validType, false);
        def.value = {};
        assert.strictEqual(def.validType, false);
        def.value = [];
        assert.strictEqual(def.validType, false);
        
        def = new definition({type: "number"});
        assert.strictEqual(def.validType, false);
        def.value = 123;
        assert.strictEqual(def.validType, true);
        def.value = true;
        assert.strictEqual(def.validType, false);
        def.value = "test";
        assert.strictEqual(def.validType, false);
        def.value = "123";
        assert.strictEqual(def.validType, false);
        def.value = function(){};
        assert.strictEqual(def.validType, false);
        def.value = {};
        assert.strictEqual(def.validType, false);
        def.value = [];
        assert.strictEqual(def.validType, false);

        def = new definition({type: "boolean"});
        assert.strictEqual(def.validType, false);
        def.value = 123;
        assert.strictEqual(def.validType, false);
        def.value = true;
        assert.strictEqual(def.validType, true);
        def.value = "test";
        assert.strictEqual(def.validType, false);
        def.value = "123";
        assert.strictEqual(def.validType, false);
        def.value = function(){};
        assert.strictEqual(def.validType, false);
        def.value = {};
        assert.strictEqual(def.validType, false);
        def.value = [];
        assert.strictEqual(def.validType, false);

        def = new definition({type: "function"});
        assert.strictEqual(def.validType, false);
        def.value = 123;
        assert.strictEqual(def.validType, false);
        def.value = true;
        assert.strictEqual(def.validType, false);
        def.value = "test";
        assert.strictEqual(def.validType, false);
        def.value = "123";
        assert.strictEqual(def.validType, false);
        def.value = function(){};
        assert.strictEqual(def.validType, true);
        def.value = {};
        assert.strictEqual(def.validType, false);
        def.value = [];
        assert.strictEqual(def.validType, false);
        
        def = new definition({type: "object"});
        assert.strictEqual(def.validType, false);
        def.value = 123;
        assert.strictEqual(def.validType, false);
        def.value = true;
        assert.strictEqual(def.validType, false);
        def.value = "test";
        assert.strictEqual(def.validType, false);
        def.value = "123";
        assert.strictEqual(def.validType, false);
        def.value = function(){};
        assert.strictEqual(def.validType, false);
        def.value = {};
        assert.strictEqual(def.validType, true);
        def.value = [];
        assert.strictEqual(def.validType, true);
    });
    
    it("`validType` should return true if `value instanceof type`", function(){
        var def = new definition({ type: Array });
        assert.strictEqual(def.validType, false);
        def.value = 123;
        assert.strictEqual(def.validType, false);
        def.value = [];
        assert.strictEqual(def.validType, true);
        def.value = {};
        assert.strictEqual(def.validType, false);

        var CustomClass = function(){};
        var def = new definition({ type: CustomClass });
        assert.strictEqual(def.validType, false);
        def.value = 123;
        assert.strictEqual(def.validType, false);
        def.value = [];
        assert.strictEqual(def.validType, false);
        def.value = {};
        assert.strictEqual(def.validType, false);
        def.value = new CustomClass();
        assert.strictEqual(def.validType, true);

        var def = new definition({ type: Date });
        assert.strictEqual(def.validType, false);
        def.value = new Date();
        assert.strictEqual(def.validType, true);
        
    });
    
});
