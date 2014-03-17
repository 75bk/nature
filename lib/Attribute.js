"use strict";
var wodge = require("wodge");

/**
Enforces strict type and value checking on thing properties
@class PropertyDefinition
@constructor
*/
function Attribute(properties){
    var self = this,
        _required = properties.required || false,
        _invalidMsg = properties.invalidMsg,
        _type = properties.type,
        _valueTest = properties.valueTest,
        _value = properties.value,
        _valid,
        _validationMessages = [];

    function addValidationMessage(msg){
        _validationMessages.push(msg);
    }
    
    function validateValue(){
        if (_required){
            if (!_value) {
                addValidationMessage("Missing required value");
            }
        }
        
        if (_value !== undefined){
            if (typeof _type === "string"){
                if (typeof _value !== _type){
                    addValidationMessage(_value + " is not a string");
                }
            } else if (typeof _type === "function"){
                if (!(_value instanceof _type)){
                    addValidationMessage("Value is not an instance of " + _type.name);
                }
            }
            
            wodge.arrayify(_valueTest).forEach(function(valueTest){
                if(valueTest instanceof RegExp){
                    /*
                    tested value must not be null or undefined, as `/\w+/.test(undefined)` returns true
                    */
                    if (_value){
                        if (!valueTest.test(_value)){
                            addValidationMessage("Failed valueTest: " + _value);
                        }
                    } else {
                        addValidationMessage("Failed valueTest: no value to test");
                    }
                } else if(typeof valueTest === "function"){
                    try{
                        var extras = {
                            addValidationMessage: addValidationMessage,
                            thing: properties.parent
                        };
                        var result = valueTest.call(extras, _value);
                        if (!result){
                            addValidationMessage("Failed valueTest function: " + _value);
                        }
                    } catch(e){
                        addValidationMessage("valueTest function crashed: " + e);
                    }
                } else {
                    if (_value !== valueTest){
                        addValidationMessage("value does not match valueTest");
                    }
                }
            });
        }
    }

    function validate(){
        _valid = true;
        _validationMessages.splice(0);
        validateValue();
        
        if (_validationMessages.length){
            _valid = false;
            if (self.invalidMsg) addValidationMessage(self.invalidMsg);

            if (self.throwOnInvalid){
                console.log("Property: " + self.name);
                console.log(_validationMessages.join("\n"));
                throw new Error("INVALID");
            }
        }
    }


    /**
    Gets/sets the property value. Will attempt to convert values to Number for definitions of `type` "number".
    @property value
    @type Any
    */
    Object.defineProperty(this, "value", {
        enumerable: true,
        get: function(){ return _value; },
        set: function(newValue){
            // typecast to Number
            if (this.type === "number" && wodge.isNumber(newValue)){
                _value = Number(newValue);

            // typecast to Array
            } else if (this.type === Array && newValue && !Array.isArray(newValue)){
                if (typeof newValue === "object"){
                    _value = [ newValue ];
                } else {
                    _value = newValue.toString().split(",").map(function(val){ return val.trim(); });
                }

            // typecast to RegExp
            } else if (this.type === RegExp && typeof newValue === "string"){
                try{
                    _value = new RegExp(newValue);
                } catch(e) {
                    _value = newValue;
                }

            // every other case, just set the value
            } else {
                _value = newValue;
            }
            validate();
        }
    });

    /**
    @property type
    @type String | Function
    @example
        thing.define({ name: "name", type: "string" });
        thing.define({ name: "created", type: Date });
        thing.define({ name: "onComplete", type: "function" });
        thing.define({ name: "data", type: JobData });
        thing.define({ name: "properties", type: Object });
        thing.define({ name: "files", type: Array });
    */
    Object.defineProperty(this, "type", {
        enumerable: true,
        get: function(){ return _type; },
        set: function(newValue){
            _type = newValue;
            validate();
        }
    });

    /**
    A regular expression, function or Array containing one or more of each. A value
    must return true for all to be valid.
    @property valueTest
    @type Regexp | Function | Array
    @example
        thing.define({ name: "name", type: "string", valueTest: /\w{3}/ })
        thing.define({ name: "age", type: "number", valueTest: function(value){ return value > 16; } })
        thing.define({
            name: "colours",
            type: Array,
            valueTest: [
                /red/,
                function(colours){
                    return colours.length > 0;
                }
            ]
        });
    */
    Object.defineProperty(this, "valueTest", {
        enumerable: true,
        get: function(){ return _valueTest; },
        set: function(newValue){
            _valueTest = newValue;
            validate();
        }
    });

    /**
    Thing instance will remain invalid until a value is set
    @property required
    @type Boolean
    */
    Object.defineProperty(this, "required", {
        enumerable: true,
        get: function(){ return _required; },
        set: function(newValue){
            _required = newValue;
            validate();
        }
    });

    /**
    @property invalidMsg
    @type string
    */
    Object.defineProperty(this, "invalidMsg", {
        enumerable: true,
        get: function(){ return _invalidMsg; },
        set: function(newValue){
            _invalidMsg = newValue;
            validate();
        }
    });

    /**
    @property valid
    @type Boolean
    */
    Object.defineProperty(this, "valid", {
        enumerable: true,
        get: function(){ return _valid; },
    });

    /**
    @property validationMessages
    @type Array
    */
    Object.defineProperty(this, "validationMessages", {
        enumerable: true,
        get: function(){ return _validationMessages; },
    });

    /**
    tags
    @property groups
    @type Array
    */
    this.groups = properties.groups || [];

    /**
    @property name
    @type string
    */
    if (!properties.name) throw new Error("must specify a name on the Attribute");
    this.name = properties.name;

    /**
    if unnamed values are passed to thing.set(), set them AS AN ARRAY on this property
    @property defaultOption
    @type Boolean
    */
    this.defaultOption = properties.defaultOption;

    /**
    @property alias
    @type string
    */
    this.alias = properties.alias;

    this.throwOnInvalid = properties.throwOnInvalid;

    validate();
}

module.exports = Attribute;
