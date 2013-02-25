var util = require("util");
/**
@class OptionDefinition
@constructor
*/
function OptionDefinition(options){
    var self = this, _value,  _valid, 
        _type, _validType, _validValue,
        _errors = [];
    
    if (!options.name)
        throw new Error("must specify a name on the OptionDefinition");
        
    /**
    @property value
    @type Any
    */
    Object.defineProperty(this, "value", { 
        get: getValue, 
        set: setValue, 
        enumerable: true, 
        configurable: true 
    });
    function getValue(){ 
        return _value; 
    }
    function setValue(newValue){
        _value = newValue;
        validate();
    }
    
    /**
    @property type
    @type {String|Function}
    @example
        config.option("name", { type: "string" }); 
        config.option("created", { type: Date });
        config.option("onComplete", { type: "function" });
        config.option("data", { type: JobData });
        config.option("options", { type: Object }); 
        config.option("files", { type: Array });
    */
    Object.defineProperty(this, "type", { 
        enumerable: true, 
        configurable: true, 
        get: getType, 
        set: setType 
    });
    function setType(newValue){
        _type = newValue;
        validate();
    }
    function getType(){ 
        return _type; 
    }
        
    /**
    @property valid
    @type {Regexp|Function|Array}
    @example
        config.option("name", { type: "string", valid: /\w{3}/ })
        config.option("age", { type: "number", valid: function(value){ return value > 16; } })
        config.option("colours", { 
            type: Array, 
            valid: [ 
                /red/, 
                function(colours){ 
                    return colours.length > 0;
                } 
            ] 
        });
    */
    Object.defineProperty(this, "valid", { 
        get: getValid, 
        set: setValid, 
        enumerable: true, 
        configurable: true 
    });
    function getValid(){ 
        return _valid; 
    }
    function setValid(newValue){
        _valid = newValue;
        validate();
    }
    
    /**
    @property validType
    */
    Object.defineProperty(this, "validType", { get: getValidType, enumerable: true, configurable: true });
    function getValidType(){ 
        return _validType; 
    }

    /**
    @property validValue
    */    
    Object.defineProperty(this, "validValue", { get: getValidValue, enumerable: true, configurable: true });
    function getValidValue(){ 
        return _validValue; 
    }

    function validate(){
        function addValidationError(msg){
            _errors.push(msg);
        }
        
        function validType(value, type, required){
            var output;
            if (value === undefined){
                output = true && !required;
            } else {
                if (typeof type === "string"){
                    output = typeof value === type;
                } else if (typeof type === "function"){
                    output = value instanceof type;
                } else {
                    output = true;
                }
            }
        
            if (!output){
                if (self.invalidMsg){
                    addValidationError(self.invalidMsg);
                } else {
                    addValidationError(util.format(
                        "Invalid type [value: %s, type: %s, required: %s]", 
                        value, 
                        typeof type === "function" ? type.name : type, 
                        required
                    ));
                }            
            } 
            return output;
        }

        function validValue(value, validTest, required){
            var validTests = validTest instanceof Array 
                ? validTest
                : [ validTest ];
            var output;

            if (value === undefined && required){
                output = false;
            } else if (value === undefined && !required) {
                output = true;
            } else {
                output = validTests.every(function(validTest){
                    if(validTest instanceof RegExp){
                        return validTest.test(value);
                    } else if(typeof validTest === "function"){
                        try{
                            var extras = {
                                addValidationError: addValidationError
                            };
                            return validTest.call(extras, value);
                        } catch(e){
                            addValidationError("valid test function crashed: " + e);
                            return false;
                        }
                    } else {
                        return true;
                    }
                });
            }
            if (!output){
                if (self.invalidMsg){
                    addValidationError(self.invalidMsg);
                } else {
                    addValidationError(util.format(
                        "Invalid value [value: %s, validTest: %s, required: %s]", 
                        value, 
                        typeof validTest === "function" ? validTest.name || validTest : validTest, 
                        required
                    ));
                }
            }
            return output;
        }
        
        _errors.splice(0);
        _validType = validType(self.value, self.type, self.required);
        _validValue = validValue(self.value, self.valid, self.required);
    }
    
    /**
    @property isValid
    @type Boolean
    */
    Object.defineProperty(this, "isValid", { get: getIsValid, enumerable: true, configurable: true });
    function getIsValid(){ 
        return _validType && _validValue;
    }


    /**
    The default value to set on a new option
    @property default
    @type Any
    */
    this.errors = _errors;
    this.default = options.default;
    this.value = options.value || options.default;
    this.group = options.group;
    this.groups = options.groups || [];
    this.name = options.name;
    this.invalidMsg = options.invalidMsg;

    /**
    Config instance will remain invalid until a value is set
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

    this.valid = options.valid;
    this.type = options.type;
    this.alias = options.alias;
}

module.exports = OptionDefinition;