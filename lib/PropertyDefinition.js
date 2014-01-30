var util = require("util");

/**
Enforces strict type and value checking on thing properties
@class PropertyDefinition
@constructor
*/
function PropertyDefinition(properties){
    var self = this,
        _value,
        _valueTest,
        _type,
        _validType,
        _validValue,
        _validationMessages = [];

    if (!properties.name)
        throw new Error("must specify a name on the PropertyDefinition");

    /**
    Gets/sets the property value. Will attempt to convert values to Number for definitions of `type` "number".
    @property value
    @type Any
    */
    Object.defineProperty(this, "value", { get: getValue, set: setValue, enumerable: true });
    function getValue(){
        return _value;
    }
    function setValue(newValue){
        // attempt to convert newValue to Number
        if (this.type === "number" && !isNaN(parseInt(newValue))){
            _value = Number(newValue);

        // on an Array, attempt to convert newValue to string and split it
        } else if (this.type === Array && newValue && !Array.isArray(newValue)){
            if (typeof newValue === "object"){
                _value = [ newValue ];
            } else {
                _value = newValue.toString().split(",").map(function(val){ return val.trim() });
            }

        // cast newValue to RegExp
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
    Object.defineProperty(this, "type", { enumerable: true, get: getType, set: setType });
    function setType(newValue){
        _type = newValue;
        validate();
    }
    function getType(){
        return _type;
    }

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
    Object.defineProperty(this, "valueTest", { get: getValueTest, set: setValueTest, enumerable: true });
    function getValueTest(){
        return _valueTest;
    }
    function setValueTest(newValue){
        _valueTest = newValue;
        validate();
    }

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
    @property valid
    @type Boolean
    */
    Object.defineProperty(this, "valid", { get: getValid, enumerable: true });
    function getValid(){
        return _validType && _validValue;
    }

    /**
    @property validationMessages
    @type Array
    */
    this.validationMessages = _validationMessages;

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
    this.name = properties.name;

    /**
    Thing instance will remain invalid until a value is set
    @property required
    @type Boolean
    */
    this.required = properties.required || false;

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

    /**
    @property typeFailMsg
    @type string
    */
    this.typeFailMsg = properties.typeFailMsg;
    /**
    @property valueFailMsg
    @type string
    */
    this.valueFailMsg = properties.valueFailMsg;

    this.type = properties.type;
    this.valueTest = properties.valueTest;
    this.value = properties.value;
    
    this.throwOnInvalid = properties.throwOnInvalid;

    validate();
}

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

module.exports = PropertyDefinition;