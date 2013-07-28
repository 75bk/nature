var util = require("util");

/**
Enforces strict type and value checking on config options
@class propertyDefinition
@constructor
*/
function PropertyDefinition(options){
    var self = this, 
        _value,
        _valueTest,
        _type,
        _validType, 
        _validValue,
        _validationMessages = [];
    
    if (!options.name)
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
    @type {String|Function}
    @example
        config.define({ name: "name", type: "string" }); 
        config.define({ name: "created", type: Date });
        config.define({ name: "onComplete", type: "function" });
        config.define({ name: "data", type: JobData });
        config.define({ name: "options", type: Object }); 
        config.define({ name: "files", type: Array });
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
    @property valueTest
    @type {Regexp|Function|Array}
    @example
        config.define({ name: "name", type: "string", valueTest: /\w{3}/ })
        config.define({ name: "age", type: "number", valueTest: function(value){ return value > 16; } })
        config.define({
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

        if (self.required && self.value === undefined){
            _validValue = false;
            _validationMessages.push(self.valueFailMsg || "Missing required value");
        } else {
            _validValue = isValidValue(self.value, self.valueTest, options.config, _validationMessages);
            if (!_validValue){
                _validationMessages.push(self.valueFailMsg || "Invalid value: " + self.value);
            }
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
    The default value to set on instantiation
    @property default
    @type Any
    */
    this.default = options.default;

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
    this.groups = options.groups || [];

    /**
    @property name
    @type string
    */
    this.name = options.name;

    /**
    Thing instance will remain invalid until a value is set
    @property required
    @type Boolean
    */
    this.required = options.required || false;
    
    /**
    if unnamed values are passed to config.set(), set them AS AN ARRAY on this option 
    @property defaultOption
    @type Boolean
    */
    this.defaultOption = options.defaultOption;

    /**
    @property alias
    @type string
    */
    this.alias = options.alias;
    
    /**
    @property typeFailMsg
    @type string
    */
    this.typeFailMsg = options.typeFailMsg;
    /**
    @property valueFailMsg
    @type string
    */
    this.valueFailMsg = options.valueFailMsg;
    
    this.type = options.type;
    this.valueTest = options.valueTest;
    this.value = options.value || options.default;
    
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
            return validTest.test(value);
        } else if(typeof validTest === "function"){
            try{
                var extras = {
                    addValidationMessage: addValidationMessage,
                    config: thing
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