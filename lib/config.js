// module dependencies
var util = require("util"),
    path = require("path"),
    fs = require("fs"),
    _ = require("underscore"),
    OptionDefinition = require("./optionDefinition");

function l(msg){
    console.log.apply(null, Array.prototype.slice.call(arguments));
}

/**
The base class for some Thing. Example things: 
 
* Application option list (version, update, help)
* An Output style (verbosity level, dry-run)
* CRUD capability (add, remove, list, update)

more specific things: 

* Secure database configuration (username, complex password, remote host IP)
* Video file list (video files, recursively searched, excludes hidden files)
* Young lad (name, male, between 11-19 years old)

or a hybrid of things

* A Video file list with CRUD capability
 
To define Things, first load the class
 
    var Thing = require("nature").Thing;
     
get an instance and start [defining](/classes/Config.html#method_define)
 
    var youngLad = new Thing()
        .define({ name: "firstname" });
         
    youngLad.firstname = "Geoff";
    youngLad.car = "Clio"; // Ignored, `car` is not yet defined and Thing instances are sealed (object non-extensible, properties non-configurable). 

Add [type](/classes/OptionDefinition.html#property_type) checking
 
    // additional calls to define() modify existing, or add new property definitions.
    youngLad.define({ name: "firstname", type: "string" })
        .define({ name: "DOB", type: Date });
    
    var dob = new Date("19 Feb 2000");
    youngLad.DOB = dob; // valid, `dob` is an instance of `Date`
    youngLad.firstname = dob; // invalid, `typeof dob` is not `"string"`

Add [value testing](/classes/OptionDefinition.html#property_valueTest)

    youngLad.define({ name: "gender", type: "string", valueTest: /^(male|female)$/ });
    
    youngLad.gender = "man"; // invalid
    youngLad.gender = "male"; // valid
    
[Value tests](/classes/OptionDefinition.html#property_valueTest) can be a function

    function oldEnough(age){ return age >= 11; }
    youngLad.define({ name: "age", type: "number", valueTest: oldEnough });
    
    youngLad.age = 9; // invalid, too young
    
Or an array of tests, which must all pass

    function oldEnough(age){ return age >= 11; }
    function youngEnough(age){ return age <= 19; }
    youngLad.define({ name: "age", type: "number", valueTest: [oldEnough, youngEnough] });
    
    youngLad.age = 29; // invalid, too old!

Invalid data doesn't throw an error so check the `valid` flag and `validationMessages`

    if (!youngLad.valid){
        console.log(youngLad.validationMessages); // prints "Invalid age: 22"
    }
    
Add custom validationMessages

    // you could also set `validFail` property using `define`, either is fine
    youngLad.definition("age").validFail = "You must be 16-21";

    youngLad.set("age", 9); // invalid
    console.log(youngLad.validationMessages); // prints "You must be 16-21"

Mix and match..

    var appearance = new Thing()
        .define({ name: "style", type: "string" })
        .define({ name: "labels", type: Array });

    youngLad.mixIn(appearance);

Load data in bulk

    youngLad.load({
        firstname: "Paul",
        age: 19, 
        style: "understated class with a grassroot drizzle",
        labels: [ "Paul Smith", "Burberry", "Nike" ]
    });
 
Besides object literals you can load from the command line, environment or file

    youngLad.load(process.argv);
    youngLad.load(process.env);
    youngLad.load("./profile.json");
  
Other ways of retrieving values

    youngLad.toJSON(); // get entire set
    youngLad.where({ group: "primary" }).toJSON(); // get sub-set
 
@class Thing
@constructor
*/
function Config(){
    var _definitions = {};
    
    /**
    Define an option
    @method define
    @chainable
    @param {String|Array} [groups] The group or groups to add the new option definition to 
    @param {Object|OptionDefinition|Array} definitions The new option definitions 
    @example
        var vehicleConfig = new Config()
            .define({ name: "maxSpeed", type: "number", alias: "m", valid: /\d+/, default: 4 })
            .define({ name: "isTaxed", type: "boolean", default: false })
            .define("specifications", [
                { name: "engineSize", type: "number" },
                { name: "wheels", type: "number" }
            ]);
    */
    this.define = function(){
        var definition, groupName, 
            self = this;
    
        if (arguments.length == 1 ){
            // define(optionDefinition)
            if (typeof arguments[0] === "object" && !Array.isArray(arguments[0])){
                definition = arguments[0];

            // define(optionDefinitionArray)
            } else if (Array.isArray(arguments[0])) {
                var optionDefinitionArray = arguments[0];
                optionDefinitionArray.forEach(function(def){
                    self.define(def);
                });
                return this; 
                
            } else {
                throw new Error("Please pass a single or array of option definitions");
            }
    
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

        // set the parent config on the definition
        definition.config = this;
        
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
        
        function getter(){
            return this.get(name);
        }
        function setter(val){
            return this.set(name, val);
        }

        Object.defineProperty(this, name, { enumerable: true, configurable: true, get: getter, set: setter });
        return this;
    }
    
    /**
    @method getDefinition
    @param {String} optionName full name or alias
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
    Object.defineProperty(this, "definitions", { get: definitions, enumerable: true });
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
                        definition.value = value;
                    }
                } else {
                    throw new Error("cannot set a value on this unspecified option: " + option);
                }
            }
        }

        return this;
    };
}

/**
@property valid
@type Boolean
*/
Object.defineProperty(Config.prototype, "valid", { get: getValid, enumerable: true, configurable: true });
function getValid() {
    return _.every(this.definitions, function(def, option){
        return def.valid;
    });
}

/**
@property errors
@type Array
*/
Object.defineProperty(Config.prototype, "errors", {
    enumerable: true,
    get: getErrors
});
function getErrors(){
    var output = [],
        self = this;
    this.options.forEach(function(option){
        var errors = self.definition(option).validationMessages;
        if (errors.length){
            output = output.concat({
                option: option,
                errors: errors   
            });
        }
    });
    return output;
}

/**
a list of defined Options
@property options
@type Array
*/
Object.defineProperty(Config.prototype, "options", { enumerable: true, get: getOptions });
function getOptions(){
    return Object.keys(this.definitions);
}
    

/**
Groups an option. 
@method group
@param {String} groupName The group 
@chainable
*/
Config.prototype.group = function(groupName, optionArray){
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
    
/**
@method ungroup
@param String groupName
@param Array [optionNames]
@chainable
@example
    config.ungroup("video");
    config.ungroup("video", ["stereo", "channels"]);
*/
Config.prototype.ungroup = function(groupName, optionNameArray){
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
    return this;
};
    
/**
returns a new config instance containing a subset of the options
@method where
@param Object filterOptions
@return Config
*/
Config.prototype.where = function(filterOptions){
    var result = new Config();

    for (var optionName in this.definitions){
        var definition = this.definition(optionName),
            tests = [];

        if (filterOptions.group){
            tests.push(definition.groups.indexOf(filterOptions.group) > -1);
        }
            
        if (filterOptions.name){
            var query = filterOptions.name;
            if ("$ne" in query){
                tests.push(query["$ne"].indexOf(definition.name) == -1)
            }
        }
            
        if (tests.every(function(i){ return i; })){
            result.define(definition);
        }
    }

        
    return result;
}

/**
Returns the set options as an array suitable for passing to say, Child_Process.
@method toArray
@return Array
*/
Config.prototype.toArray = function(quote){
    var output = _.pairs(this.toJSON());
    output.forEach(function(pair){
        if (pair[0].length == 1){
            pair[0] = "-" + pair[0];
        } else {
            pair[0] = "--" + pair[0];
        }
        if (quote) pair[1] = '"' + pair[1] + '"';
    });
    output = _.flatten(output);
    return output;
};

/**
@method unset
@param {String} optionName unset the option value
*/
Config.prototype.unset = function unset(optionName){
    this.definition(optionName).value = undefined;
    return this;
};

/**
@method get
@param {String} option Option name
@return {Any} Option Value
*/
Config.prototype.get = function get(option){
    return this.definition(option).value;
};

/**
@method toJSON
@return {Object} Containing Option/value pairs
*/
Config.prototype.toJSON = function() {
    var output = {};
    _.each(this.definitions, function(def, key){
        if (def.value !== undefined){
            output[key] = def.value;  
        }
    });
    return output;
};
    
/**
Mix in options from another config instance
@method mixIn
@chainable
@param {Config} config The config instance to mix in
@param {String|Array} [groups] The group or groups to put the added options in
*/
Config.prototype.mixIn = function(config, groups){
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
    return this;
}

/**
Returns a copy of the config instance
@method clone
@return Config
*/
Config.prototype.clone = function(){
    var clone = new Config();
    _.each(this.definitions, function(def, optionName){
        clone.define(_.clone(def));
    });
    return clone;
};

/**
Returns true if the specified option has a value set. If you pass an array, will return 
true if at least one of the values is set. 
@method hasValue
@param {Array|String} options A single, or array of option names
@return Boolean
@example
    config.hasValue("verbose");
    config.hasValue([ "verbose", "debug" ]);
*/
Config.prototype.hasValue = function(option){
    var self = this;
    // check through list for at least one match
    if (Array.isArray(option)){
        return option.some(function(optionName){
            return self.hasValue(optionName);
        });

    // specific option
    } else {
        return this.get(option) !== undefined;
    }
};
    
module.exports = Config;
