/**
@class OptionDefinition
@constructor
*/
function OptionDefinition(options){
    /**
    The default value to set on a new option
    @property default
    @type Any
    */
    this.default = options.default;
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
    this.valid = options.valid;

    Object.defineProperty(this, "validType", { get: validType });
    function validType(){
        if (this.value === undefined){
            return true && !this.required;
        } else {
            if (typeof this.type === "string"){
                return typeof this.value === this.type;
            } else if (typeof this.type === "function"){
                return this.value instanceof this.type;
            } else {
                return true;
            }
        }
    }

    Object.defineProperty(this, "validValue", { get: validValue });
    function validValue(){
        var self = this;
        var validTests = this.valid instanceof Array 
            ? this.valid
            : [ this.valid ];

        if (this.value === undefined && this.required){
            return false;
        } else {
            return validTests.every(function(validTest){
                if(validTest instanceof RegExp){
                    return validTest.test(self.value);
                } else if(typeof validTest === "function"){
                    return validTest(self.value);
                } else {
                    return true;
                }
            });
        }
    }

    Object.defineProperty(this, "isValid", { get: isValid });
    function isValid(){
        return this.validType && this.validValue;
    }

    // this.invalidMsg
}

module.exports = OptionDefinition;