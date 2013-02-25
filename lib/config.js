// module dependencies
var util = require("util"),
    path = require("path"),
    fs = require("fs"),
    _ = require("underscore"),
    OptionDefinition = require("./optionDefinition");

/**
 @class Config
 @module config-master
 @constructor
 @chainable
*/
function Config(){
    var _definitions = {};
    var _currentGroup = ""; 
    var _currentSubGroup = "";
    
    /**
     @method group
     @chainable
    */
    this.group2 = function(groupName, optionArray){
        var self = this;
        
        if (optionArray){
            if (!Array.isArray(optionArray))
                optionArray = [optionArray];
            
            optionArray.forEach(function(optionName){
                var definition = self.definition(optionName);
                if (definition.groups.indexOf(groupName) === -1){
                    definition.groups.push(groupName);
                }
            });
        } else {
            this.options.forEach(function(optionName){
                var definition = self.definition(optionName);
                if (definition.groups.indexOf(groupName) === -1){
                    definition.groups.push(groupName);
                }
            });
        }
        
        return this;
    }
    
    this.ungroup = function(groupName, optionNameArray){
        var self = this;
        if (optionNameArray){
            if (!Array.isArray(optionNameArray)){
                optionNameArray = [optionNameArray];
            }
            optionNameArray.forEach(function(optionName){
                var definition = self.definition(optionName);
                if (definition){
                    definition.groups = _.without(definition.groups, groupName);
                } else {
                    throw new Error("option does not exist: " + optionName);
                }
            });
        } else {
            this.options.forEach(function(optionName){
                var definition = self.definition(optionName);
                definition.groups = _.without(definition.groups, groupName);
            });
        }
    };
    
    this.where = function(filterOptions){
        if (filterOptions.group){
            var result = new Config();
            for (var optionName in this.definitions){
                if (this.definition(optionName).groups.indexOf(filterOptions.group) > -1){
                    result.define(this.definition(optionName));
                }
            }
            return result;
        }
    }


    this.group = function(name){
        _currentGroup = name;
        _currentSubGroup = "";
        return this;
    };
    

    /**
    Sets the subgroup name given to subsequent option definitions
     @method subgroup
     @param {String} name
     @chainable
    */
    this.subgroup = function(name){
        _currentSubGroup = name;
        return this;
    };

    this.define = function(){
        var definition, groupName, 
            self = this;
    
        if (arguments.length == 1 ){
            // define(optionDefinition)
            if (typeof arguments[0] === "object" && !Array.isArray(arguments[0]))
                definition = arguments[0];
            else
                throw new Error("Please pass an config definition object");
    
        } else if (arguments.length == 2){
            var groups = Array.isArray(arguments[0])
                ? arguments[0]
                : [arguments[0]];
    
            // define(groups, definitionArray)
            if (Array.isArray(arguments[1])){
                var definitionArray = arguments[1];
                definitionArray.forEach(function(definition){
                    self.define(groups, definition);
                });
                return self;
            } else {
                definition = arguments[1];
                definition.groups = groups;
            }
                
        }
        
        if (!(definition instanceof OptionDefinition)){
            definition = new OptionDefinition(definition);
        }
     
        var name = definition.name;
        
        // duplication checks
        if (typeof _definitions[name] !== "undefined"){
            throw new Error("Cannot create config option, name already exists: " + name);
        }
        if (definition.alias && typeof _definitions[definition.alias] !== "undefined"){
            throw new Error("Cannot create config option, alias already exists: " + definition.alias);
        }
     
        // create alias
        if (definition.alias !== undefined){
            _definitions[definition.alias] = name;
        }
    
        _definitions[name] = definition;
        return this;
    }
    
    /**
    Define an option
     @method option
     @chainable
     @param {String} name
     @param {OptionDefinition} definition
     @example
         var vehicleConfig = new Config()
             .option("maxSpeed", { type: "number", alias: "m", valid: /\d+/, default: 4 })
             .option("isTaxed", { type: "boolean", default: false })
    */
    this.option = function option(name, definition){
        definition.name = name;
        
        // duplication checks
        if (typeof _definitions[name] !== "undefined"){
            throw new Error("Cannot create config option, name already exists: " + name);
        }
        if (definition.alias && typeof _definitions[definition.alias] !== "undefined"){
            throw new Error("Cannot create config option, alias already exists: " + definition.alias);
        }
        
        // set the group if not passed in
        if (typeof definition.group === "undefined"){
            definition.group = groupString();
        }
     
        // create alias
        if (definition.alias !== undefined){
            _definitions[definition.alias] = name;
        }
    
        _definitions[name] = new OptionDefinition(definition);
        return this;
    };

    /**
    a list of defined Options
    @property options
    @type Array
    */
    Object.defineProperty(this, "options", { enumerable: true, configurable: true, get: getOptions });
    function getOptions(){
        return Object.keys(_definitions).filter(function(key){ return key.length > 1; });
    }
    
    /**
    @method definition
    @param {String} optionName
    @return Object
    */
    this.definition = function(optionName){
        var item = _definitions[optionName];
        if (item !== undefined){
            var output = typeof item === "string"
                ? _definitions[item]
                : item;
            return output;
        } else {
            throw new Error("unspecified option: " + optionName);
        }
    };
    
    /**
    @property definitions
    @type Object
    */
    Object.defineProperty(this, "definitions", { get: definitions });
    function definitions(){
        var output = {};
        _.each(_definitions, function(def, option){
            if (typeof def !== "string"){
                output[option] = def;
            }
        });
        return output;
    };

    /**
     Returns the number of options in the current group/subgroup
     @method size
     @return {Number} total items
    */
    this.size = function(){
        return _.where(_definitions, { group: groupString() }).length;
    };

    /**
     @method hasValue
     @param {Array|String} options If a string is passed, tests whether the option has a value. With an Array passed, tests whether at least one of the options named have a value. 
     @chainable
    */
    this.hasValue = function(option){
        var self = this;
    
        // check through list for at least one match
        if (Array.isArray(option)){
            return option.some(function(optionName){
                return self.get(optionName) !== undefined;
            });

        // specific option
        } else {
            return self.get(option) !== undefined;
        }
    
        return this;
    };

    /**
     @method set
     @param {Config|Object|String|Array} option Pass a Config instance, string to set a single value, an object to set multiple values
     @param {Any} value
     @chainable
    */
    this.set = function set(option, value){
        var self = this;

        if (option){
            if (option instanceof Config){
                var config = option;
                config.options.forEach(function(optionName){
                    self.set(optionName, config.get(optionName));
                });

            } else if (typeof option === "object" && !Array.isArray(option)){
                var options = option;
                _.each(options, function(value, key){
                    self.set(key, value);
                })

            } else if (Array.isArray(option)){
                var arrayItems = option, 
                    item,
                    defaultValues = [];
                while (typeof (item = arrayItems.shift()) !== "undefined"){
                    // options
                    var optionPattern = /^-{1,2}/;
                    if(optionPattern.test(item)){
                        option = item.replace(optionPattern, "");
                        if(this.definition(option).type == "boolean"){
                            this.set(option, true);
                        } else if (!optionPattern.test(arrayItems[0])) {
                            this.set(option, arrayItems.shift());
                        }
                    } else {
                        defaultValues.push(item);
                    }
                }
                
                if (defaultValues.length > 0){
                    var defaultOptionName = "";
                    _.each(_definitions, function(definition, optionName){
                        if (definition.defaultOption){
                            // always sets an array - need a "setter" property on OptionDefinition to fix this
                            if (definition.type === Array){
                                self.set(optionName, defaultValues);                            
                            } else {
                                self.set(optionName, defaultValues[0]);                            
                            }
                        }
                    });
                }
                
            } else {
                if (_definitions[option] !== undefined){
                    // alias 
                    if (typeof _definitions[option] === "string"){
                        this.set(_definitions[option], value);
                    }
                    
                    // normal
                    else {
                        var definition = this.definition(option);
                        if (definition.type === Array){
                            definition.value = Array.isArray(value)
                                ? value
                                : value.split(",").map(function(val){ return val.trim() });
                        } else {
                            definition.value = value;
                        }
                    }
                } else {
                    throw new Error("cannot set a value on this unspecified option: " + option);
                }
            }
        }

        return this;
    };

    /**
     @method unset
     @param {String} option Delete the option definition
    */
    this.unset = function unset(option){
        if (_definitions[option] !== undefined){
            _definitions[option].value = undefined;
        } else {
            throw new Error("unspecified option: " + option);
        }

        return this;
    };

    /**
     @method get
     @param {String} option Option name
     @return {Any} Option Value
    */
    this.get = function get(option){
        var item = _definitions[option];
        if (item !== undefined){
            if (typeof item === "string"){
                return _definitions[item].value;
            } else {
                return item.value;
            }
        } else {
            throw new Error("unspecified option: " + option);
        }
    };

    /**
     @method toJSON
     @param {string} groupName Group name
     @return {Object} Containing Option/value pairs
    */
    this.toJSON = function() {
        var output = {};
        _.each(_definitions, function(def, key){
            if (def.value !== undefined && def.group.indexOf(groupString()) > -1){
                output[key] = def.value;  
            }
        });
        return output;
    };

    this.toJSON2 = function() {
        var output = {};
        _.each(this.definitions, function(def, key){
            if (def.value !== undefined){
                output[key] = def.value;  
            }
        });
        return output;
    };
    
    this.mixIn = function(config, groups){
        var self = this;
        if (config instanceof Config){
            config.options.forEach(function(optionName){
                if (groups){
                    self.define(groups, config.definition(optionName));
                } else {
                    self.define(config.definition(optionName));
                }
            });
        } else {
            throw new Error("mixIn: must pass in an instance of Config");
        }
    }

    /**
    @method clone
    @return Config
    */
    this.clone = function(){
        var clone = new Config();
        _.each(this.definitions, function(def, optionName){
            clone.option(optionName, _.clone(def)); 
        });
        return clone;
    };
    
    /**
    @property isValid
    @type Boolean
    */
    Object.defineProperty(this, "isValid", { get: isValid, enumerable: true, configurable: true });
    function isValid() {
        return _.every(this.definitions, function(def, option){
            return def.isValid;
        });
    }

    // private functions
    function groupString(){
        return _currentGroup + (_currentSubGroup ? "." + _currentSubGroup : "");
    }

    return this;
}

/**
Returns the set options as an array suitable for passing to say, Child_Process.
@method toArray
@return Array
*/
Config.prototype.toArray = function(){
    var output = _.pairs(this.toJSON());
    output.forEach(function(pair){
        if (pair[0].length == 1){
            pair[0] = "-" + pair[0];
        } else {
            pair[0] = "--" + pair[0];
        }
    });
    output = _.flatten(output);
    return output;
};

/**
@method toConfig
@return Config
*/
Config.prototype.toConfig = function(){};

Config.prototype.addToGroup = function(groupName, options){
    options = Array.isArray(options) 
        ? options
        : [options];
    
    
}

/**
@property errors
@type Array
*/
Object.defineProperty(Config.prototype, "errors", {
    configurable: true,
    enumerable: true,
    get: getErrors
});
function getErrors(){
    var output = [],
        self = this;
    this.options.forEach(function(option){
        var errors = self.definition(option).errors;
        if (errors.length){
            output = output.concat({
                option: option,
                errors: errors   
            });
        }
    });
    return output;
}

module.exports = Config;
