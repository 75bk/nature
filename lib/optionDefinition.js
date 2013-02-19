/**
@class OptionDefinition
@constructor
*/
function OptionDefinition(options){
    var self = this, _value,  _valid, 
        _type, _validType, _validValue;
    
    /**
    The default value to set on a new option
    @property default
    @type Any
    */
    this.default = options.default;
    
    Object.defineProperty(this, "value", { get: function(){ return _value; }, set: function(newValue){
        _value = newValue;
        _validType = validType(_value, self.type, self.required);
        _validValue = validValue(_value, self.valid, self.required);
    }, enumerable: true, configurable: true });

    this.value = options.default;
    this.group = options.group;
    
    /**
    Config instance will remain invalid until a value is set
    @property required
    @type Boolean
    */
    this.required = options.required;
    
    /**
    if unnamed values are passed to config.set(), set them on this option 
    @property defaultOption
    @type Boolean
    */
    this.defaultOption = options.defaultOption;
    
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
    Object.defineProperty(this, "type", { get: function(){ return _type; }, set: function(newValue){
        _type = newValue;
        _validType = validType(self.value, self.type, self.required);
        _validValue = validValue(self.value, self.valid, self.required);
    }, enumerable: true, configurable: true });
    this.type = options.type;
    
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
    Object.defineProperty(this, "valid", { get: function(){ return _valid; }, set: function(newValue){
        _valid = newValue;
        _validType = validType(self.value, self.type, self.required);
        _validValue = validValue(self.value, self.valid, self.required);
    }, enumerable: true, configurable: true });
    this.valid = options.valid;
    
    this.error = "";

    Object.defineProperty(this, "validType", { get: function(){ return _validType; }, enumerable: true, configurable: true });
    Object.defineProperty(this, "validValue", { get: function(){ return _validValue; }, enumerable: true, configurable: true });
    Object.defineProperty(this, "isValid", { get: function(){ 
        return _validType && _validValue;
    }, enumerable: true, configurable: true });

    function validType(value, type, required){
        if (value === undefined){
            return true && !required;
        } else {
            if (typeof type === "string"){
                return typeof value === type;
            } else if (typeof type === "function"){
                return value instanceof type;
            } else {
                return true;
            }
        }
    }

    function validValue(value, validTest, required){
        var validTests = validTest instanceof Array 
            ? validTest
            : [ validTest ];

        if (value === undefined && required){
            return false;
        } else {
            return validTests.every(function(validTest){
                if(validTest instanceof RegExp){
                    return validTest.test(value);
                } else if(typeof validTest === "function"){
                    return validTest(value);
                } else {
                    return true;
                }
            });
        }
    }
}

module.exports = OptionDefinition;