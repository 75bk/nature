var assert = require("assert"),
    Definition = require("../lib/PropertyDefinition");

var CustomClass = function(){};

function factory(name){
    var definitions = {
        name:   { name: "one" }),
        string: { name: "one", type: "string" }),
        number: { name: "one", type: "number" }),
        bool:   { name: "one", type: "boolean" },
        func:   { name: "one", type: "function" },
        obj:    { name: "one", type: "object" },
        array:  { name: "one", type: Array }),
        custom: { name: "one", type: CustomClass }),
        date:   { name: "one", type: Date }),
        
        { name: "one", type: "number", default: 4, valueTest: smallNumber });
        { name: "one", type: Array, default: [0,4,6], valueTest: smallArray });
        { name: "one", type: "number", required: true, default: 1 });
        { name: "one", type: Array, required: true, valueTest: function(files){
        { name: "one",  type: Array,  valueTest: validArray,  valueFailMsg: "every value must be over 10" });
        { name: "one", type: RegExp, value: "\\w{4}" });
        { name: "one", type: "string", value: "ok" });
        { name: "one", type: "number", value: "not ok" });
        { name: "one", type: RegExp, value: /ok/ });
        { name: "one", type: RegExp, typeFail: "pass a regex", value: "ok" });
        { name: "one", type: RegExp, typeFail: "pass a regex", value: "+++" });
        { name: "relative", type: "string", value: "dog", valueTest: /^(dad|sister|brother|mother)$/, valueFail: "invalid relative" });
        { name: "family", type: Array, value: ["dad", "sister", "dog"], valueTest: /(dad|sister|brother|mother)/ });
        { name: "family", type: Array, value: ["dad", "sister", "dog"], valueTest: function(family){ return family.every(function(member){ return /^(dad|sister|brother|mother)$/.test(member); }); }, valueFail: "every member must be valid" });
        {name: "one", type: "number", valueTest: validTest, valueFailMsg: "must supply a value over 10" });    };
    return new Definition(definitions[name]);
}

describe("PropertyDefinition", function(){
    describe("properties: ", function(){
        it("access to `this.config` in a `valid` function must fail if config is not set");
        
        it("should be ok to have an option with no defined type");
        it("type: [Array, Function] should allow a type of either");
        
        describe(".valid", function(){
            it("valid if no type specified", function(){
                var def = factory("name");
                assert.strictEqual(def.valid, true);
            });

            it("valid when value matches type`", function(){
                var def = factory("string");
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
    
                def = factory("number");
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

                def = factory("boolean");
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

                def = factory("function");
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
    
                def = factory("object");
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

            it("valid when value instanceof type", function(){
                var def = factory("array");
                def.value = 123;
                assert.strictEqual(def.valid, true); // converted to Array
                assert.deepEqual(def.value, [ 123 ]);
                def.value = [];
                assert.strictEqual(def.valid, true);
                assert.deepEqual(def.value, [ ]);
                def.value = {};
                assert.strictEqual(def.valid, true);
                assert.deepEqual(def.value, [ {} ]);
                def.value = "a string";
                assert.strictEqual(def.valid, true); // converted to Array
                assert.deepEqual(def.value, [ "a string" ]);
                def.value = new Date();
                assert.strictEqual(def.valid, true); // converted to Array
                assert.ok(def.value[0] instanceof Date);

                var def = factory("custom");
                assert.strictEqual(def.valid, true);
                def.value = 123;
                assert.strictEqual(def.valid, false);
                def.value = [];
                assert.strictEqual(def.valid, false);
                def.value = {};
                assert.strictEqual(def.valid, false);
                def.value = new CustomClass();
                assert.strictEqual(def.valid, true);

                var def = factory("date");
                assert.strictEqual(def.valid, true);
                def.value = new Date();
                assert.strictEqual(def.valid, true);
            });
    
            it("valid with .required", function(){
                /*
                required means 'value should be truthy'
                */
                var def = factory("string");
                assert.strictEqual(def.valid, true);
                def.required = true;
                assert.strictEqual(def.valid, false);
                def.value = "";
                assert.strictEqual(def.valid, false);
                def.value = " ";
                assert.strictEqual(def.valid, true);

                def = factory("number");
                assert.strictEqual(def.valid, true);
                def.required = true;
                assert.strictEqual(def.valid, false);
                def.value = 0;
                assert.strictEqual(def.valid, false);
                def.value = 1;
                assert.strictEqual(def.valid, true);
            
                def = factory("array");
                assert.strictEqual(def.valid, true);
                def.required = true;
                assert.strictEqual(def.valid, false);
            });
            
            it("valid with RegExp .valueTest", function(){
                /*
                any definition with a valueTest should always be tested. Required is implied.
                */
                def = factory("string");
                def.valueTest = /test/;
                assert.strictEqual(def.valid, false);
                def.required = true;
                assert.strictEqual(def.valid, false);
                def.required = false;
                assert.strictEqual(def.valid, false);
                def.value = "test";
                assert.strictEqual(def.valid, true);
                def.valueTest = /tast/;
                assert.strictEqual(def.valid, false);            
            });

            it("valid with primitive .valueTest", function(){
                def = factory("bool");
                def.valueTest = false;
                def.value = false;
                assert.strictEqual(def.valid, true);
                def.valueTest = /true/;
                assert.strictEqual(def.valid, false);
                def.valueTest = "false";
                assert.strictEqual(def.valid, false);

                def = factory("number");
                def.valueTest = 5;
                def.value = 5;
                assert.strictEqual(def.valid, true);
                def.valueTest = 4;
                assert.strictEqual(def.valid, false);
                def.valueTest = "5";
                assert.strictEqual(def.valid, false);
            });
    
            it("valid with function .validTest", function(){
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
        });
        
        describe(".validationMessages", function(){
            it("custom invalid msg with type `Array`", function(){
                function validArray(values){
                    return values.every(function(val){
                        return val > 10;
                    });
                }
                var def = new Definition({ name: "one",  type: Array,  valueTest: validArray,  valueFailMsg: "every value must be over 10" });
            
                def.value = [1];
                assert.deepEqual(def.validationMessages, ["every value must be over 10"]);

                def.value = [11];
                assert.deepEqual(def.validationMessages, []);
            });
        });
        
        describe(".value", function(){
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
            
            it("a regex string should typecast to a RegExp", function(){
                var def = new Definition({ name: "one", type: RegExp, value: "\\w{4}" });
                assert.ok(def.value instanceof RegExp, def.value);
                assert.deepEqual(def.value, /\w{4}/);
            });
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
                
                // "ok" parses by RegExp
                def = new Definition({ name: "one", type: RegExp, typeFail: "pass a regex", value: "ok" });
                assert.strictEqual(def.valid, true);
                assert.strictEqual(def.validationMessages.length, 0);

                // "+++" does not parse by RegExp
                def = new Definition({ name: "one", type: RegExp, typeFail: "pass a regex", value: "+++" });
                assert.strictEqual(def.valid, false);
                assert.strictEqual(def.validationMessages.length, 1);
            });
            
            it("value validation summary", function(){
                var def = new Definition({ name: "relative", type: "string", value: "dog", valueTest: /^(dad|sister|brother|mother)$/, valueFail: "invalid relative" });
                assert.strictEqual(def.valid, false);
                assert.strictEqual(def.validationMessages.length, 1);
                def.value = "dad";
                assert.strictEqual(def.valid, true);
                assert.strictEqual(def.validationMessages.length, 0);

                def = new Definition({ name: "family", type: Array, value: ["dad", "sister", "dog"], valueTest: /(dad|sister|brother|mother)/ });
                assert.strictEqual(def.valid, true);

                def = new Definition({ name: "family", type: Array, value: ["dad", "sister", "dog"], valueTest: function(family){ return family.every(function(member){ return /^(dad|sister|brother|mother)$/.test(member); }); }, valueFail: "every member must be valid" });
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

            it("inserting error messages from a `valid` function", function(){
                function validArray(values){
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
