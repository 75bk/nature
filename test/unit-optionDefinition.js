var assert = require("assert"),
    Definition = require("../lib/optionDefinition");

describe("OptionDefinition", function(){
    describe("properties: ", function(){
        it("access to `this.config` in a `valid` function must fail if config is not set");
        
        it("a number string should typecast to a Number type automatically", function(){
           var def = new Definition({ name: "one", type: "number" }) ;
           
           def.value = "3";
           assert.strictEqual(def.value, 3);
           assert.strictEqual(def.valid, true);

           def.value = "0";
           assert.strictEqual(def.value, 0);
           assert.strictEqual(def.valid, true);

           def.value = "-1";
           assert.strictEqual(def.value, -1);
           assert.strictEqual(def.valid, true);

           def.value = -1.5345;
           assert.strictEqual(def.value, -1.5345);
           assert.strictEqual(def.valid, true);

           def.value = "-1.5345";
           assert.strictEqual(def.value, -1.5345);
           assert.strictEqual(def.valid, true);

           def.value = "a";
           assert.strictEqual(def.value, "a");
           assert.strictEqual(def.valid, false);

           def.value = "";
           assert.strictEqual(def.value, "");
           assert.strictEqual(def.valid, false);

           def.value = true;
           assert.strictEqual(def.value, true);
           assert.strictEqual(def.valid, false);

           def.value = function(){};
           assert.strictEqual(def.valid, false);

           def.value = null;
           assert.strictEqual(def.value, null);
           assert.strictEqual(def.valid, false);

           def.value = undefined;
           assert.strictEqual(def.value, undefined);
           assert.strictEqual(def.valid, true); // if an option is not required an undefined value is ok
        });
        
        describe("validation", function(){
            it("type validation summary", function(){
                var def = new Definition({ name: "one", type: "string", value: "ok" });
                assert.strictEqual(def.valid, true);
                assert.strictEqual(def.validationMessages.length, 0);
                
                def = new Definition({ name: "one", type: "number", value: "not ok" });
                assert.strictEqual(def.valid, false);
                assert.strictEqual(def.validationMessages.length, 1);

                def = new Definition({ name: "one", type: RegExp, value: /ok/ });
                assert.strictEqual(def.valid, true);
                assert.strictEqual(def.validationMessages.length, 0);
                
                def = new Definition({ name: "one", type: RegExp, typeFail: "pass a regex", value: "not ok" });
                assert.strictEqual(def.valid, false);
                assert.strictEqual(def.validationMessages.length, 1);
            });
            
            it("value validation summary", function(){
                var def = new Definition({ 
                    name: "relative", 
                    type: "string", 
                    value: "dog", 
                    valueTest: /^(dad|sister|brother|mother)$/,
                    valueFail: "invalid relative"
                });
                assert.strictEqual(def.valid, false);
                assert.strictEqual(def.validationMessages.length, 1);
                def.value = "dad";
                assert.strictEqual(def.valid, true);
                assert.strictEqual(def.validationMessages.length, 0);

                def = new Definition({
                    name: "family", 
                    type: Array, 
                    value: ["dad", "sister", "dog"],
                    valueTest: /(dad|sister|brother|mother)/
                });
                assert.strictEqual(def.valid, true);

                def = new Definition({
                    name: "family", 
                    type: Array, 
                    value: ["dad", "sister", "dog"], 
                    valueTest: function(family){
                        return family.every(function(member){
                            return /^(dad|sister|brother|mother)$/.test(member);
                        });
                    },
                    valueFail: "every member must be valid"
                });
                assert.strictEqual(def.valid, false);
                assert.strictEqual(def.validationMessages.length, 1);

                def = new Definition({
                    name: "family", 
                    type: Array, 
                    value: ["dad", "sister", "dog"], 
                    valueTest: function(family){
                        var self = this;
                        return family.every(function(member){
                            if (/^(dad|sister|brother|mother)$/.test(member)){
                                return true;
                            } else {
                                self.addValidationMessage("this one is invalid: " + member);
                                return false;
                            }
                        });
                    },
                    valueFail: "every member must be valid"
                });
                assert.strictEqual(def.valid, false);
                assert.strictEqual(def.validationMessages.length, 2);
            });
            
            it("`valid` should return true if no type specified", function(){
                var def = new Definition({ name: "one" });
                assert.strictEqual(def.valid, true);
            });
    
            it("`valid` should return true when `typeof value === type`", function(){
                var def = new Definition({ name: "one", type: "string" });
                assert.strictEqual(def.valid, true);
                def.value = 123;
                assert.strictEqual(def.valid, false);
                def.value = true;
                assert.strictEqual(def.valid, false);
                def.value = "test";
                assert.strictEqual(def.valid, true);
                def.value = function(){};
                assert.strictEqual(def.valid, false);
                def.value = {};
                assert.strictEqual(def.valid, false);
                def.value = [];
                assert.strictEqual(def.valid, false);
        
                def = new Definition({name: "one", type: "number"});
                assert.strictEqual(def.valid, true);
                def.value = 123;
                assert.strictEqual(def.valid, true);
                def.value = true;
                assert.strictEqual(def.valid, false);
                def.value = "test";
                assert.strictEqual(def.valid, false);
                def.value = "123";
                assert.strictEqual(def.valid, true); // numeric string gets typecast to Number
                def.value = function(){};
                assert.strictEqual(def.valid, false);
                def.value = {};
                assert.strictEqual(def.valid, false);
                def.value = [];
                assert.strictEqual(def.valid, false);

                def = new Definition({name: "one", type: "boolean"});
                assert.strictEqual(def.valid, true);
                def.value = 123;
                assert.strictEqual(def.valid, false);
                def.value = true;
                assert.strictEqual(def.valid, true);
                def.value = "test";
                assert.strictEqual(def.valid, false);
                def.value = "123";
                assert.strictEqual(def.valid, false);
                def.value = function(){};
                assert.strictEqual(def.valid, false);
                def.value = {};
                assert.strictEqual(def.valid, false);
                def.value = [];
                assert.strictEqual(def.valid, false);

                def = new Definition({name: "one", type: "function"});
                assert.strictEqual(def.valid, true);
                def.value = 123;
                assert.strictEqual(def.valid, false);
                def.value = true;
                assert.strictEqual(def.valid, false);
                def.value = "test";
                assert.strictEqual(def.valid, false);
                def.value = "123";
                assert.strictEqual(def.valid, false);
                def.value = function(){};
                assert.strictEqual(def.valid, true);
                def.value = {};
                assert.strictEqual(def.valid, false);
                def.value = [];
                assert.strictEqual(def.valid, false);
        
                def = new Definition({name: "one", type: "object"});
                assert.strictEqual(def.valid, true);
                def.value = 123;
                assert.strictEqual(def.valid, false);
                def.value = true;
                assert.strictEqual(def.valid, false);
                def.value = "test";
                assert.strictEqual(def.valid, false);
                def.value = "123";
                assert.strictEqual(def.valid, false);
                def.value = function(){};
                assert.strictEqual(def.valid, false);
                def.value = {};
                assert.strictEqual(def.valid, true);
                def.value = [];
                assert.strictEqual(def.valid, true);
            });
    
            it("`valid` should return true if `value instanceof type`", function(){
                var def = new Definition({ name: "one", type: Array });
                assert.strictEqual(def.valid, true);
                def.value = 123;
                assert.strictEqual(def.valid, false);
                def.value = [];
                assert.strictEqual(def.valid, true);
                def.value = {};
                assert.strictEqual(def.valid, false);

                var CustomClass = function(){};
                var def = new Definition({ name: "one", type: CustomClass });
                assert.strictEqual(def.valid, true);
                def.value = 123;
                assert.strictEqual(def.valid, false);
                def.value = [];
                assert.strictEqual(def.valid, false);
                def.value = {};
                assert.strictEqual(def.valid, false);
                def.value = new CustomClass();
                assert.strictEqual(def.valid, true);

                var def = new Definition({ name: "one", type: Date });
                assert.strictEqual(def.valid, true);
                def.value = new Date();
                assert.strictEqual(def.valid, true);
            });
        
            it("`valid` should be true with an empty value and not `required`");
        
            it("`valid` RegExp should work with primitive types", function(){
                var def = new Definition({ name: "one", type: "string", default: "test", valueTest: /es/ });
                assert.strictEqual(def.valid, true, JSON.stringify(def));
                def.valueTest = /as/;
                assert.strictEqual(def.valid, false);

                def = new Definition({ name: "one", type: "boolean", default: false, valueTest: /false/ });
                assert.strictEqual(def.valid, true);
                def.valueTest = /true/;
                assert.strictEqual(def.valid, false);
            });

            it("`valid` Function should work with primitive and object types", function(){
                function smallNumber(value) {
                    return value < 10;
                }
                var def = new Definition({ name: "one", type: "number", default: 4, valueTest: smallNumber });
                assert.strictEqual(def.valid, true);
                def.value = 11;
                assert.strictEqual(def.valid, false);

                function smallArray(a){
                    return a.length < 10;
                }
                def = new Definition({ name: "one", type: Array, default: [0,4,6], valueTest: smallArray });
                assert.strictEqual(def.valid, true);
                def.value = [1,2,3,4,5,6,7,5,4,3,2,1,0];
                assert.strictEqual(def.valid, false);
            });
        
            it("`valid` should accept and test an array of functions");
    
            it("`valid` should return false if option `required` with no value set", function(){
                var def = new Definition({ name: "one", type: "number", required: true });
                assert.strictEqual(def.valid, false);
            
                def = new Definition({ name: "one", type: "number", required: true, default: 1 });
                assert.strictEqual(def.valid, true);
            });
        
            describe("bad usage", function(){
                it("`valid` should return `false` if `valueTest` function threw", function(){
                    var def = new Definition({ name: "one", type: Array, required: true, valueTest: function(files){
                        throw new Error("error");
                    }});
                
                    def.value = ["test"];
                    assert.strictEqual(def.valid, false);
                });
            });
        
            it("custom invalid msg with type `number`", function(){
                function validTest(value){
                    return value > 10;
                }
                var def = new Definition({name: "one", type: "number", valueTest: validTest, valueFailMsg: "must supply a value over 10" });
            
                def.value = 1;
                assert.deepEqual(def.validationMessages, ["must supply a value over 10"]);

                def.value = 11;
                assert.deepEqual(def.validationMessages, []);
            });

            it("custom invalid msg with type `Array`", function(){
                function validArray(values){
                    return values.every(function(val){
                        return val > 10;
                    });
                }
                var def = new Definition({
                    name: "one", 
                    type: Array, 
                    valueTest: validArray, 
                    valueFailMsg: "every value must be over 10" 
                });
            
                def.value = [1];
                assert.deepEqual(def.validationMessages, ["every value must be over 10"]);

                def.value = [11];
                assert.deepEqual(def.validationMessages, []);
            });

            it("inserting error messages from a `valid` function", function(){
                function validArray(values){
                    console.log(this);
                    var valid = true, self = this;
                    values.forEach(function(val){
                        if (val < 10){
                            valid = false; 
                            self.addValidationMessage("less than 10: " + val);
                        }
                    });
                    return valid;
                }
                var def = new Definition({
                    name: "one", 
                    type: Array, 
                    valueTest: validArray, 
                    valueFailMsg: "every value must be over 10" 
                });
            
                def.value = [1];
                assert.deepEqual(def.validationMessages, ["less than 10: 1", "every value must be over 10"]);

                def.value = [11];
                assert.deepEqual(def.validationMessages, []);
            });
        });
    });
});
