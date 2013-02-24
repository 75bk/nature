var assert = require("assert"),
    Definition = require("../lib/optionDefinition");

describe("OptionDefinition", function(){
    describe("properties: ", function(){
        it("`validType` should return true if no type specified", function(){
            var def = new Definition({ name: "one" });
            assert.strictEqual(def.validType, true);
        });
    
        it("`validType` should return true when `typeof value === type`", function(){
            var def = new Definition({ name: "one", type: "string" });
            assert.strictEqual(def.validType, true);
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
        
            def = new Definition({name: "one", type: "number"});
            assert.strictEqual(def.validType, true);
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

            def = new Definition({name: "one", type: "boolean"});
            assert.strictEqual(def.validType, true);
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

            def = new Definition({name: "one", type: "function"});
            assert.strictEqual(def.validType, true);
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
        
            def = new Definition({name: "one", type: "object"});
            assert.strictEqual(def.validType, true);
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
            var def = new Definition({ name: "one", type: Array });
            assert.strictEqual(def.validType, true);
            def.value = 123;
            assert.strictEqual(def.validType, false);
            def.value = [];
            assert.strictEqual(def.validType, true);
            def.value = {};
            assert.strictEqual(def.validType, false);

            var CustomClass = function(){};
            var def = new Definition({ name: "one", type: CustomClass });
            assert.strictEqual(def.validType, true);
            def.value = 123;
            assert.strictEqual(def.validType, false);
            def.value = [];
            assert.strictEqual(def.validType, false);
            def.value = {};
            assert.strictEqual(def.validType, false);
            def.value = new CustomClass();
            assert.strictEqual(def.validType, true);

            var def = new Definition({ name: "one", type: Date });
            assert.strictEqual(def.validType, true);
            def.value = new Date();
            assert.strictEqual(def.validType, true);
        });
        
        it("`validValue` should be true with an empty value and not `required`", function(){
            
        });
        
        it("`valid` RegExp should work with primitive types", function(){
            var def = new Definition({ name: "one", type: "string", default: "test", valid: /es/ });
            assert.strictEqual(def.validValue, true, JSON.stringify(def));
            def.valid = /as/;
            assert.strictEqual(def.validValue, false);

            def = new Definition({ name: "one", type: "boolean", default: false, valid: /false/ });
            assert.strictEqual(def.validValue, true);
            def.valid = /true/;
            assert.strictEqual(def.validValue, false);
        });

        it("`valid` Function should work with primitive and object types", function(){
            function smallNumber(value) {
                return value < 10;
            }
            var def = new Definition({ name: "one", type: "number", default: 4, valid: smallNumber });
            assert.strictEqual(def.validValue, true);
            def.value = 11;
            assert.strictEqual(def.validValue, false);

            function smallArray(a){
                return a.length < 10;
            }
            def = new Definition({ name: "one", type: Array, default: [0,4,6], valid: smallArray });
            assert.strictEqual(def.validValue, true);
            def.value = [1,2,3,4,5,6,7,5,4,3,2,1,0];
            assert.strictEqual(def.validValue, false);
        });
        
        it("`valid` should accept and test an array of functions");
    
        it("`isValid` should return true if both type and value valid", function(){
            var def = new Definition({ name: "one", type: "string", default: "test" });
            assert.strictEqual(def.validType, true);
            assert.strictEqual(def.validValue, true);
            assert.strictEqual(def.isValid, true);

            var def = new Definition({ name: "one", type: "string" });
            assert.strictEqual(def.validType, true);
            assert.strictEqual(def.validValue, true);
            assert.strictEqual(def.isValid, true);
        });
        
        it("`validType` and `validValue` should return false if option `required` with no value set", function(){
            var def = new Definition({ name: "one", type: "number", required: true });
            assert.strictEqual(def.validType, false);
            assert.strictEqual(def.validValue, false);
            assert.strictEqual(def.isValid, false);
            
            def = new Definition({ name: "one", type: "number", required: true, default: 1 });
            assert.strictEqual(def.validType, true);
            assert.strictEqual(def.validValue, true);
            assert.strictEqual(def.isValid, true);            
        });
        
        describe("bad usage", function(){
            it("`validValue` should return `false` if `valid` function threw", function(){
                var def = new Definition({ name: "one", type: Array, required: true, valid: function(files){
                    throw new Error("error");
                }});
                
                def.value = ["test"];
                assert.strictEqual(def.validType, true);
                assert.strictEqual(def.validValue, false);
                // assert.strictEqual(def.errors.length, 1, JSON.stringify(def.errors));
                
            });
        });
        
        it("custom invalid msg with type `number`", function(){
            function validTest(value){
                return value > 10;
            }
            var def = new Definition({name: "one", type: "number", valid: validTest, invalidMsg: "must supply a value over 10" });
            
            def.value = 1;
            assert.deepEqual(def.errors, ["must supply a value over 10"]);

            def.value = 11;
            assert.deepEqual(def.errors, []);
        });

        it("custom invalid msg with type `Array`", function(){
            function validArray(values){
                return values.every(function(val){
                    return val > 10;
                });
            }
            var def = new Definition({name: "one", type: Array, valid: validArray, invalidMsg: "every value must be over 10" });
            
            def.value = [1];
            assert.deepEqual(def.errors, ["every value must be over 10"]);

            def.value = [11];
            assert.deepEqual(def.errors, []);
        });

        it("inserting error messages from a `valid` function", function(){
            function validArray(values){
                var valid = true, self = this;
                values.forEach(function(val){
                    if (val < 10){
                        valid = false; 
                        self.addValidationError("less than 10: " + val);
                    }
                });
                return valid;
            }
            var def = new Definition({name: "one", type: Array, valid: validArray, invalidMsg: "every value must be over 10" });
            
            def.value = [1];
            assert.deepEqual(def.errors, ["less than 10: 1", "every value must be over 10"]);

            def.value = [11];
            assert.deepEqual(def.errors, []);
        });
    });
});
