var util = require("util"),
    wodge = require("wodge");

function isValidType(value, type){
    if (value === undefined){
        return true;
    } else if (typeof type === "string"){
        return typeof value === type;
    } else if (typeof type === "function"){
        return value instanceof type;
    } else {
        return true;
    }
}

function isValidValue(value, validTests, thing, validationMessages){
    if (!Array.isArray(validTests)) validTests = [ validTests ];

    function addValidationMessage(msg){
        validationMessages.push(msg);
    }

    return validTests.every(function(validTest){
        if(validTest instanceof RegExp){
            /*
            value must not be null or undefined, as `/\w+/.test(undefined)` returns true
            */
            if (!value) value = "";
            return validTest.test(value);
        } else if(typeof validTest === "function"){
            try{
                var extras = {
                    addValidationMessage: addValidationMessage,
                    thing: thing
                };
                return validTest.call(extras, value);
            } catch(e){
                addValidationMessage("valid test function crashed: " + e);
                return false;
            }
        } else {
            return true;
        }
    });
}

/**
Enforces strict type and value checking on thing properties
@class PropertyDefinition
@constructor
*/
function PropertyDefinition(properties){
    var self = this,
        _required = properties.required || false,
        _typeFailMsg = properties.typeFailMsg,
        _valueFailMsg = properties.valueFailMsg,
        _type = properties.type,
        _valueTest = properties.valueTest,
        _value = properties.value,
    
        _validType,
        _validValue,
        _validationMessages = [];

    function validate(){
        _validationMessages.splice(0);

        _validType = isValidType(self.value, self.type);
        if (!_validType){
            _validationMessages.push(self.typeFailMsg || "Invalid type: " + self.value);
        }

        if (self.value === undefined){
            if (self.required){
                _validValue = false;
                _validationMessages.push(self.valueFailMsg || "Missing required value");
            } else {
                _validValue = true;
            }
        } else {
            _validValue = isValidValue(self.value, self.valueTest, properties.parent, _validationMessages);
            if (!_validValue){
                _validationMessages.push(self.valueFailMsg || "Invalid value: " + self.value);
            }
        }

        if (self.throwOnInvalid && (!_validValue || !_validType)){
            console.log("Property: " + self.name);
            console.log(_validationMessages.join("\n"));
            throw new Error("INVALID");
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
                    _value = newValue.toString().split(",").map(function(val){ return val.trim() });
                }

            // typecast to RegExp
            } else if (this.type === RegExp && typeof newValue === "string"){
                try{
                    _value = RegExp(newValue);
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
    @property typeFailMsg
    @type string
    */
    Object.defineProperty(this, "typeFailMsg", { 
        enumerable: true,
        get: function(){ return _typeFailMsg; },
        set: function(newValue){ 
            _typeFailMsg = newValue; 
            validate();
        }
    });

    /**
    @property valueFailMsg
    @type string
    */
    Object.defineProperty(this, "valueFailMsg", { 
        enumerable: true,
        get: function(){ return _valueFailMsg; },
        set: function(newValue){ 
            _valueFailMsg = newValue; 
            validate();
        }
    });

    /**
    @property valid
    @type Boolean
    */
    Object.defineProperty(this, "valid", { 
        enumerable: true,
        get: function(){ return _validType && _validValue; },
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
    if (!properties.name) throw new Error("must specify a name on the PropertyDefinition");
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

module.exports = PropertyDefinition;
