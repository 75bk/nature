"use strict";

var util = require("util"),
    path = require("path"),
    _ = require("underscore"),
    PropertyDefinition = require("./PropertyDefinition"),
    EventEmitter = require("events").EventEmitter;

var l = console.log;

/**
The base class for some Thing. Example things:

* Application property list (version, update, help)
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

get an instance and start defining

    var youngLad = new Thing()
        .define({ name: "firstname" });

    youngLad.firstname = "Geoff";
    youngLad.car = "Clio"; // Ignored, `car` is not yet defined and Thing instances are sealed (object non-extensible, properties non-configurable).

Add type checking

    // additional calls to define() redefine an existing property, or add new property definitions.
    youngLad.define({ name: "firstname", type: "string" })
        .define({ name: "DOB", type: Date });

    var dob = new Date("19 Feb 2000");
    youngLad.DOB = dob; // valid, `dob` is an instance of `Date`
    youngLad.firstname = dob; // invalid, `typeof dob` is not `"string"`

Add value testing

    youngLad.define({ name: "gender", type: "string", valueTest: /^(male|female)$/ });

    youngLad.gender = "man"; // invalid
    youngLad.gender = "male"; // valid

Value tests can be a function

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

    youngLad.set({
        firstname: "Paul",
        age: 19,
        style: "understated class with a grassroot drizzle",
        labels: [ "Paul Smith", "Burberry", "Nike" ]
    });

Besides object literals you can load from the command line, environment or file

    youngLad.set(process.argv);
    youngLad.set(process.env);
    youngLad.set("./profile.json");

Other ways of retrieving values

    youngLad.toJSON(); // get entire set
    youngLad.where({ group: "primary" }).toJSON(); // get sub-set

@class Thing
@constructor
*/
function Thing(options){
    initInstanceVars.call(this, options);
}
util.inherits(Thing, EventEmitter);
/**
Define an property
@method define
@chainable
@param {String | Array} [groups] The group or groups to add the new property definition to
@param {Object | PropertyDefinition | Array} definitions The new property definitions
@example
    var vehicleThing = new Thing()
        .define({ name: "maxSpeed", type: "number", alias: "m", valueTest: /\d+/, default: 4 })
        .define({ name: "isTaxed", type: "boolean", default: false })
        .define("specifications", [
            { name: "engineSize", type: "number" },
            { name: "wheels", type: "number" }
        ]);
*/
Thing.prototype.define = function(){
    var definition, groupName,
        self = this;

    initInstanceVars.call(this);

    if (arguments.length === 0){
        error.call(this, new Error("missing definition"));
    } else if (arguments.length == 1 ){
        // define(propertyDefinition)
        if (typeof arguments[0] === "object" && !Array.isArray(arguments[0])){
            definition = arguments[0];

        // define(propertyDefinitionArray)
        } else if (Array.isArray(arguments[0])) {
            var propertyDefinitionArray = arguments[0];
            propertyDefinitionArray.forEach(function(def){
                self.define(def);
            });
            return this;

        } else {
            error.call(this, new Error("Please pass a single or array of property definitions"));
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

    // set the parent thing on the definition
    definition.parent = this;
    
    definition.throwOnInvalid = this.throwOnInvalid;

    if (!(definition instanceof PropertyDefinition)){
        definition = new PropertyDefinition(definition);
    }

    var name = definition.name;

    // duplication checks
    var existingDef = this._definitions[name];
    if (typeof existingDef !== "undefined"){
        delete this._definitions[existingDef.alias]
        delete this._definitions[name];
    }
    if (definition.alias && typeof this._definitions[definition.alias] !== "undefined"){
        error.call(this, Error("Cannot create property, alias already exists: " + definition.alias));
    }

    // create alias
    if (definition.alias !== undefined){
        this._definitions[definition.alias] = name;
    }

    this._definitions[name] = definition;

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
@method definition
@param {String} propertyName Full name or alias
@return Object
*/
Thing.prototype.definition = function(propertyName){
    initInstanceVars.call(this);
    if (!propertyName) error.call(this, new Error("please supply an propertyName"));

    var item = this._definitions[propertyName];
    if (item !== undefined){
        var output = typeof item === "string"
            ? this._definitions[item]
            : item;
        return output;
    }
};

/**
@property definitions
@type Object
*/
Object.defineProperty(Thing.prototype, "definitions", { get: definitions, enumerable: true });
function definitions(){
    initInstanceVars.call(this);
    var output = {};
    for (var prop in this._definitions){
        var def = this._definitions[prop];
        if (typeof def !== "string"){
            output[prop] = def;
        }
    }
    return output;
};

/**
Set a value on the specified property
@method set
@param {Thing | Object | String | Array} property Pass a Thing instance, string to set a single value, an object to set multiple values
@param {Any} value
@chainable
*/
Thing.prototype.set = function set(property, value){
    var self = this;
    initInstanceVars.call(this);

    if (property){
        if (property instanceof Thing){
            var thing = property;
            thing.properties.forEach(function(propertyName){
                self.set(propertyName, thing.get(propertyName));
            });

        } else if (typeof property === "object" && !Array.isArray(property)){
            var properties = property;
            _.each(properties, function(value, key){
                self.set(key, value);
            })

        } else if (Array.isArray(property)){
            var arrayItems = property.slice(0),
                item,
                defaultValues = [];

            if (property === process.argv && path.basename(arrayItems[0]) === "node"){
                arrayItems.splice(0, 2);
            }

            while (typeof (item = arrayItems.shift()) !== "undefined"){
                var propertyPattern = /^-{1,2}/;
                if(propertyPattern.test(item)){
                    property = item.replace(propertyPattern, "");
                    var def = this.definition(property);
                    if (def){
                        if(def.type === "boolean"){
                            this.set(property, true);
                        } else if (arrayItems.length) {
                            this.set(property, arrayItems.shift());
                        }
                    } else {
                        error.call(this, new Error("invalid property: " + property));
                    }
                } else {
                    defaultValues.push(item);
                }
            }

            if (defaultValues.length > 0){
                var defaultOptionName = "";
                _.each(this._definitions, function(definition, propertyName){
                    if (definition.defaultOption){
                        // always sets an array - need a "setter" property on PropertyDefinition to fix this
                        if (definition.type === Array){
                            self.set(propertyName, defaultValues);
                        } else {
                            self.set(propertyName, defaultValues[0]);
                        }
                    }
                });
            }

        } else {
            if (this._definitions[property] !== undefined){
                // alias
                if (typeof this._definitions[property] === "string"){
                    this.set(this._definitions[property], value);
                }

                // normal
                else {
                    var definition = this.definition(property);
                    definition.value = value;
                }
            } else {
                error.call(this, new Error("invalid property: " + property));
            }
        }
    }

    return this;
};

/**
@property valid
@type Boolean
*/
Object.defineProperty(Thing.prototype, "valid", { get: getValid, enumerable: true, configurable: true });
function getValid() {
    initInstanceVars.call(this);
    return this._errors.length === 0 && _.every(this.definitions, function(def){
        return def.valid;
    });
}

/**
An array containing a list of invalid properties
@property validationMessages
@type Array
*/
Object.defineProperty(Thing.prototype, "validationMessages", {
    enumerable: true,
    get: getValidationMessages
});
function getValidationMessages(){
    var output = [],
        self = this,
        validationMessages;
    this.properties.forEach(function(property){
        validationMessages = self.definition(property).validationMessages;
        if (validationMessages.length){
            output = output.concat({
                property: property,
                validationMessages: validationMessages
            });
        }
    });

    output.toString = function(){
        var toString = "";
        this.forEach(function(prop){
            prop.validationMessages.forEach(function(msg){
                toString += prop.property + ":\t" + msg + "\n";
            });
        });
        return toString;
    }

    return output;
}

/**
A annoy of defined properties
@property properties
@type Array
*/
Object.defineProperty(Thing.prototype, "properties", { enumerable: true, get: getProperties });
function getProperties(){
    return Object.keys(this.definitions);
}


/**
Groups a property
@method group
@param {String} groupName The group
@chainable
*/
Thing.prototype.group = function(groupName, propertyArray){
    var self = this;

    if (propertyArray){
        if (!Array.isArray(propertyArray))
            propertyArray = [propertyArray];

        propertyArray.forEach(function(propertyName){
            var definition = self.definition(propertyName);
            if (definition.groups.indexOf(groupName) === -1){
                definition.groups.push(groupName);
            }
        });
    } else {
        this.properties.forEach(function(propertyName){
            var definition = self.definition(propertyName);
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
@param Array [propertyNames]
@chainable
@example
    thing.ungroup("video");
    thing.ungroup("video", ["stereo", "channels"]);
*/
Thing.prototype.ungroup = function(groupName, propertyNameArray){
    var self = this;
    if (propertyNameArray){
        if (!Array.isArray(propertyNameArray)){
            propertyNameArray = [propertyNameArray];
        }
        propertyNameArray.forEach(function(propertyName){
            var definition = self.definition(propertyName);
            if (definition){
                definition.groups = _.without(definition.groups, groupName);
            } else {
                error.call(this, new Error("property does not exist: " + propertyName));
            }
        });
    } else {
        this.properties.forEach(function(propertyName){
            var definition = self.definition(propertyName);
            definition.groups = _.without(definition.groups, groupName);
        });
    }
    return this;
};

/**
returns a new thing instance containing a subset of the properties
@method where
@param {Object} filterOptions Mongo style query
@return {Thing} A new Thing instance with the filters applied
@example 
    var excludeProperties = thing.where({
        name: { $ne: ["preset-list", "help", "scan", "title" ] }
    });

    var certainGroup = thing.where({ group: "handbrake" });
*/
Thing.prototype.where = function(filterOptions){
    var result = new Thing();

    for (var propertyName in this.definitions){
        var definition = this.definition(propertyName),
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
Returns the set properties as an array suitable for passing to say, Child_Process.
@method toArray
@param quote {Boolean} Set to true to wrap the properties values in double quotes
@return Array
*/
Thing.prototype.toArray = function(quote){
    var output = _.pairs(this.toJSON());
    output.forEach(function(pair){
        if (pair[0].length === 1){
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
@param {String} propertyName unset the property value
*/
Thing.prototype.unset = function unset(propertyName){
    this.definition(propertyName).value = undefined;
    return this;
};

/**
@method get
@param {String} property Property name
@return {Any} Property Value
*/
Thing.prototype.get = function get(property){
    return this.definition(property) && this.definition(property).value;
};

/**
@method toJSON
@return {Object} Containing property/value pairs
*/
Thing.prototype.toJSON = function() {
    var output = {};
    _.each(this.definitions, function(def, key){
        if (def.value !== undefined){
            output[key] = def.value;
        }
    });
    return output;
};

/**
Mix in properties from another thing instance
@method mixIn
@chainable
@param {Thing} thing The thing instance to mix in
@param {String | Array} [groups] The group or groups to put the added properties in
*/
Thing.prototype.mixIn = function(thing, groups){
    var self = this;
    if (thing instanceof Thing){
        thing.properties.forEach(function(propertyName){
            if (groups){
                self.define(groups, thing.definition(propertyName));
            } else {
                self.define(thing.definition(propertyName));
            }
        });
    } else {
        error.call(this, new Error("mixIn: must pass in an instance of Thing"));
    }
    return this;
}

/**
Returns a copy of the thing instance
@method clone
@return Thing
*/
Thing.prototype.clone = function(){
    var clone = new Thing();
    _.each(this.definitions, function(def, propertyName){
        clone.define(_.clone(def));
    });
    return clone;
};

/**
Returns true if the specified property has a value set. If you pass an array, will return
true if at least one of the values is set.
@method hasValue
@param {Array | String} properties A single, or array of property names
@return Boolean
@example
    thing.hasValue("verbose");
    thing.hasValue([ "verbose", "debug" ]);
*/
Thing.prototype.hasValue = function(property){
    var self = this;
    // check through list for at least one match
    if (Array.isArray(property)){
        return property.some(function(propertyName){
            return self.hasValue(propertyName);
        });

    // specific property
    } else {
        return this.get(property) !== undefined;
    }
};

function error(err){
    initInstanceVars.call(this);
    this._errors.push(err);
    this.emit("error", err);
}

function initInstanceVars(options){
    if (!this._definitions){
        Object.defineProperty(this, "_definitions", { enumerable: false, configurable: false, value: {} });
    }
    if (!this._errors) {
        Object.defineProperty(this, "_errors", { enumerable: false, configurable: false, value: [] });
    }
    this.throwOnInvalid = options && options.throwOnInvalid;
}

module.exports = Thing;
