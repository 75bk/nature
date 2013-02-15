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
    this.value = options.value;
    this.group = options.group;
    
    /**
    if unnamed values are passed to config.set(), set them on this option 
    @property defaultOption
    @type Boolean
    */
    this.defaultOption = options.defaultOption;
    
    /**
    @property valid
    @type {String|RegExp|Function}
    @example
        config.option("one", { }); // no validation
        config.option("one", { valid: "string" });
        config.option("one", { valid: String });
        config.option("one", { valid: /\w+/ });
        config.option("file", { 
            valid: function(file){
                return file && fs.fileExistsSync(file);
            } 
        });
    */
    this.valid = options.valid;
    
    Object.defineProperty(this, "isValid", { get: isValid });
    function isValid(){
        
    }
    // this.invalidMsg
    
    /**
    Config instance will remain invalid until a value is set
    @property required
    @type Boolean
    */
    this.required = options.required;

    this.array = false;
    this.function = false;
}

module.exports = OptionDefinition;