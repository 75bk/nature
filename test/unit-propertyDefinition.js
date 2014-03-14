"use strict";
var assert = require("assert"),
    Definition = require("../lib/PropertyDefinition"),
    def = null,
    l = console.log,
    d = function(def){ return JSON.stringify(def, null, "\t"); };

var CustomClass = function(){};

function lessThan10(value) {
    return value < 10;
}
function allLessThan10(arr){
    return arr.every(lessThan10);
}
function allFamily(arr){
    return arr.every(function(member){
        return (/^(dad|sister|brother|mother)$/).test(member);
    });
}
function allFamilyElse(arr){
    var self = this;
    return arr.every(function(member){
        if(/^(dad|sister|brother|mother)$/.test(member)){
            return true;
        } else {
            self.addValidationMessage("this one is invalid: " + member);
            return false;
        }
    });
}
function broken(){
    throw new Error("error");
}

function factory(name){
    var definitions = {
        name:   { name: "one" },
        string: { name: "one", type: "string" },
        number: { name: "one", type: "number" },
        bool:   { name: "one", type: "boolean" },
        func:   { name: "one", type: "function" },
        obj:    { name: "one", type: "object" },
        array:  { name: "one", type: Array },
        custom: { name: "one", type: CustomClass },
        date:   { name: "one", type: Date },
        regex:  { name: "one", type: RegExp }
    };
    return new Definition(definitions[name]);
}

describe("PropertyDefinition", function(){
    describe("properties: ", function(){
        it("access to `this.config` in a `valueTest` function must fail if config is not set");
        it("should be ok to have an definition with no defined type");
        it("type: [Array, Function] should allow a type of either");

        describe(".valid", function(){
            it("valid if no type specified", function(){
                def = factory("name");
                assert.strictEqual(def.valid, true);
            });

            it("valid when value matches type", function(){
                def = factory("string");
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

                def = factory("bool");
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

                def = factory("func");
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

                def = factory("obj");
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
                def = factory("array");
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

                def = factory("custom");
                def.value = 123;
                assert.strictEqual(def.valid, false);
                def.value = [];
                assert.strictEqual(def.valid, false);
                def.value = {};
                assert.strictEqual(def.valid, false);
                def.value = new CustomClass();
                assert.strictEqual(def.valid, true);

                def = factory("date");
                def.value = new Date();
                assert.strictEqual(def.valid, true);
            });

            it("valid with .required", function(){
                /*
                required means 'value should be truthy'.
                not required permits a value to be undefined.
                */
                def = factory("string");
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

                def = factory("custom");
                assert.strictEqual(def.valid, true);
                def.required = true;
                assert.strictEqual(def.valid, false);
            });
            
            it("valid with .required and .valueTest", function(){
                def = factory("string");
                assert.strictEqual(def.valid, true);
                def.valueTest = /test/;
                assert.strictEqual(def.valid, true);
                def.value = "clive"
                assert.strictEqual(def.valid, false);
                def.value = "test"
                assert.strictEqual(def.valid, true);
                def.value = "";
                assert.strictEqual(def.valid, false);
                def.value = undefined;
                assert.strictEqual(def.valid, true);
                def.required = true;
                assert.strictEqual(def.valid, false);

                def = factory("number");
                assert.strictEqual(def.valid, true);
                def.valueTest = lessThan10;
                assert.strictEqual(def.valid, true);
                def.value = "clive"
                assert.strictEqual(def.valid, false);
                def.value = 9
                assert.strictEqual(def.valid, true);
                def.value = 0;
                assert.strictEqual(def.valid, true);
                def.value = undefined;
                assert.strictEqual(def.valid, true);
                def.required = true;
                assert.strictEqual(def.valid, false);
                def.value = 0;
                assert.strictEqual(def.valid, false);
                
                def = factory("string");
                assert.strictEqual(def.valid, true);
                def.valueTest = /test/;
                assert.strictEqual(def.valid, true);
                def.valueTest = 1;
                assert.strictEqual(def.valid, true);
                def.valueTest = lessThan10;
                assert.strictEqual(def.valid, true);
                
                def = factory("number");
                assert.strictEqual(def.valid, true);
                def.valueTest = /test/;
                assert.strictEqual(def.valid, true);
                def.valueTest = 1;
                assert.strictEqual(def.valid, true);
                def.valueTest = lessThan10;
                assert.strictEqual(def.valid, true);
                
                def = factory("func");
                assert.strictEqual(def.valid, true);
                def.valueTest = /test/;
                assert.strictEqual(def.valid, true);
                def.valueTest = 1;
                assert.strictEqual(def.valid, true);
                def.valueTest = lessThan10;
                assert.strictEqual(def.valid, true);
                
                def = factory("array");
                assert.strictEqual(def.valid, true);
                def.valueTest = /test/;
                assert.strictEqual(def.valid, true);
                def.valueTest = 1;
                assert.strictEqual(def.valid, true);
                def.valueTest = lessThan10;
                assert.strictEqual(def.valid, true);
            });

            it("valid with RegExp .valueTest", function(){
                /*
                any definition with a valueTest should always be tested. Required is implied.
                */
                def = factory("string");
                def.valueTest = /test/;
                def.required = true;
                assert.strictEqual(def.valid, false);
                def.value = "test";
                assert.strictEqual(def.valid, true);
                def.valueTest = /tast/;
                assert.strictEqual(def.valid, false);

                def.valueTest = /^(dad|sister|brother|mother)$/;
                def.value = "dog";
                assert.strictEqual(def.valid, false);
                def.value = "dad";
                assert.strictEqual(def.valid, true);

                def.type = Array;
                def.valueTest = /(dad|sister|brother|mother)/;
                def.value = ["dad", "sister", "dog"];
                assert.strictEqual(def.valid, true);
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
                def = factory("number");
                def.valueTest = lessThan10;
                def.value = 4;
                assert.strictEqual(def.valid, true);

                def.value = 11;
                assert.strictEqual(def.valid, false);

                def = factory("array");
                def.valueTest = allLessThan10;
                def.value = [0,4,6];
                assert.strictEqual(def.valid, true);

                def.value = [0,4,16];
                assert.strictEqual(def.valid, false);

                def.valueTest = allFamily;
                def.value = ["dad", "sister", "dog"];
                assert.strictEqual(def.valid, false);
            });

            it("`valid` should accept and test an array of functions");

            describe("bad usage", function(){
                it("valid with function .validTest - function throws", function(){
                    def = factory("array");
                    def.valueTest = broken;
                    def.value = ["test"];
                    assert.strictEqual(def.valid, false);
                });
            });
        });

        describe(".validationMessages", function(){
            it("with no .invalidMsg", function(){
                def = factory("string");
                def.value = "ok";
                assert.strictEqual(def.validationMessages.length, 0);

                def.type = "number";
                assert.strictEqual(def.validationMessages.length, 1);

                def.type = RegExp;
                assert.strictEqual(def.validationMessages.length, 1);
            });

            it("with .invalidMsg", function(){
                def = factory("array");
                def.valueTest = allLessThan10;
                def.invalidMsg = "every value must be less than 10";

                def.value = [11];
                assert.strictEqual(def.validationMessages[1], "every value must be less than 10");

                def.value = [1];
                assert.deepEqual(def.validationMessages, []);
                
                def = factory("regex");
                def.invalidMsg = "pass a regex";
                def.value = "ok";
                assert.strictEqual(def.validationMessages.length, 0);

                def.value = "+++";
                assert.strictEqual(def.validationMessages.length, 2);
                assert.strictEqual(def.validationMessages[1], "pass a regex");
            });

            it("raised from .validTest function", function(){
                def = factory("array");
                def.value = ["dad", "sister", "dog"];
                def.valueTest = allFamilyElse;
                def.invalidMsg = "every member must be valid";
                assert.strictEqual(def.valid, false);
                assert.strictEqual(def.validationMessages.length, 3);
            });
        });

        describe(".value", function(){
            it("typecasting with number", function(){
                def = factory("number");
                def.value = "3";
                assert.strictEqual(def.value, 3);
                def.value = "0";
                assert.strictEqual(def.value, 0);
                def.value = "-1";
                assert.strictEqual(def.value, -1);
                def.value = -1.5345;
                assert.strictEqual(def.value, -1.5345);
                def.value = "-1.5345";
                assert.strictEqual(def.value, -1.5345);
                def.value = "a";
                assert.strictEqual(def.value, "a");
                def.value = "";
                assert.strictEqual(def.value, "");
                def.value = true;
                assert.strictEqual(def.value, true);
                def.value = CustomClass;
                assert.strictEqual(def.value, CustomClass);
                def.value = null;
                assert.strictEqual(def.value, null);
                def.value = undefined;
                assert.strictEqual(def.value, undefined);
            });

            it("typecasting with RegExp", function(){
                def = factory("regex");
                def.value = "\\w{4}";
                assert.ok(def.value instanceof RegExp, def.value);
                assert.deepEqual(def.value, /\w{4}/);

                def.value = "ok";
                assert.ok(def.value instanceof RegExp);
                assert.deepEqual(def.value, /ok/);

                def.value = "+++";
                assert.ok(!(def.value instanceof RegExp));
                assert.strictEqual(def.value, "+++");

            });
        });
        
        describe(".type", function(){});
        describe(".valueTest", function(){});
        describe(".required", function(){});
        describe(".invalidMsg", function(){});
        describe(".groups", function(){});
        describe(".name", function(){});
        describe(".defaultOption", function(){});
        describe(".alias", function(){});
        describe(".throwOnInvalid", function(){});
        
    });
});
