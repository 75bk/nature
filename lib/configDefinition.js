/**
@class OptionDefinition
@constructor
*/
function OptionDefinition(){
    /**
    The default value to set on a new option
    @property default
    @type Any
    */
    this.default = null;
    this.group = null;
    
    /**
    if unnamed values are passed to config.set(), set them on this option 
    @property defaultOption
    @type Boolean
    */
    this.defaultOption;
    /**
    @property valid
    @type {String|RegExp|Function}
    @example
        config.option("one", { valid: "string" });
        config.option("one", { valid: String });
        config.option("one", { valid: /\w+/ });
        config.option("file", { 
            valid: function(file){
                return file && fs.fileExistsSync(file);
            } 
        });
    */
    this.valid = null;

    this.array = false;
    this.function = false;
}

/**
@class ValidDefinition
@constructor
*/
function ValidDefinition(){
    /**
    @property type
    @type {String|Function}
    */
    this.type = null;
    /**
    @property value
    @type RegExp
    */
    this.value = null;
}