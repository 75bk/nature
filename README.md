[![NPM version](https://badge.fury.io/js/nature.png)](http://badge.fury.io/js/nature)
[![Build Status](https://travis-ci.org/75lb/nature.png)](https://travis-ci.org/75lb/nature)
[![Dependency Status](https://david-dm.org/75lb/nature.png)](https://david-dm.org/75lb/nature)
![Analytics](https://ga-beacon.appspot.com/UA-27725889-9/nature/README.md?pixel)

***library under construction***

Nature
======
The Nature library provides a class (`Thing`) which creates objects with strict, per-property type and value checking. This enables more fine-grained classification base on type *and* state. Say you have a `Person` class, with nature you can create a sub-class of `Person` in a particular state, e.g. `Drunkard`, `Scoundrel`, `Leader` etc. These Things can be reused, subclassed or merged with other Things to create new hybrids. The `Thing` class adds these features to each new object:

* Type and value validation per property
* Data loading from the command line, environment, external file or plain object
* Merging and cloning
* Property grouping and filtering
* A general mechanism for duck typing

Synopsis
--------

Enables you to write an API method like: (`Scoundrel` and `FlammableCar` are derivitives of `Thing`)
```javascript
exports.burnCar = function(arsonist){
    var scoundrel = new Scoundrel(arsonist);
    if (!scoundrel.valid){
        throw new Error(scoundrel.validationMessages.join("\n"));
        // throws:
        // The arsonist supplied must be a Scoundrel, you passed a Metrosexual
        // Invalid age 29: Must be between 11 and 19. 
        // Over 5 litres Gasoline required
        // Less compassion necessary.
    } else {
        var car = new FlammableCar(process.env);
        if (car.valid){
            // the Vauxhall Astra supplied in the environment is indeed flammable
            scoundrel.igniteCar(car);
        }
    }
}
```
Client code for the above is straight forward. In this case `burnCar()` input is taken directly from the command line. You can also pass the environment (`process.env`), an object literal or a `Thing` instance. 
```javascript
var outdoors = require("outdoor-activity");
outdoors.burnCar(process.argv);
```
Then a simple command executes the outdoor activity:
```sh
$ CAR_MAKE=Vauxhall CAR_MODEL=Astra node outdoors.js --name Alfie --age 11 --litres 13 --compassion unknown
```

API Documentation
=================
#nature

Nature, a library to help classify the things (models) in your world (app). Take charge of Nature, design Things that do stuff.

* Things can be instantiated with data directly from the command line, environment, an object literal or file.
* Once classified, Things can be re-used across your apps
* Removes all input validation code from your app

Synopsis

Enables you to write API methods like: (`YoungMan` and `FlammableCar` are derivitives of `Thing`)

    exports.burnCar = function(arsonist){
        var youngMan = new YoungMan(arsonist);
        if (!youngMan.valid){
            throw new Error(youngMan.validationMessages.join("\n"));
            // throws:
            // The arsonist supplied must be a young man.
            // Invalid age 29: Must be between 11 and 19.
            // Over 5 litres Gasoline required
            // Less compassion necessary.
        } else {
            var car = new FlammableCar(process.env);
            if (car.valid){
                // the Vauxhall Astra supplied in the environment is indeed flammable
                youngMan.igniteCar(astra);
            }
        }
    }

Client code for the above is straight forward:

    var outdoors = require("outdoor-activity");
    outdoors.burnCar(process.argv);

Then a simple command executes the outdoor activity:

    $ CAR_MAKE=Vauxhall CAR_MODEL=Astra node outdoors.js --name Alfie --age 11 --litres 13 --compassion unknown

See the Thing docs for more detail..

##Properties

###Thing

**type**: Thing

###PropertyDefinition

**type**: PropertyDefinition

#Thing

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

##Properties

###definitions

**type**: Object

###valid

**type**: Boolean

###validationMessages

An array containing a list of invalid properties

**type**: Array

###properties

A annoy of defined properties

**type**: Array

##Methods

###define

Define an property

**Chainable**: true

**Params**:  
*   groups _String | Array_

    The group or groups to add the new property definition to
*   definitions _Object | PropertyDefinition | Array_

    The new property definitions

####Example

    var vehicleThing = new Thing()
        .define({ name: "maxSpeed", type: "number", alias: "m", valueTest: /\d+/, default: 4 })
        .define({ name: "isTaxed", type: "boolean", default: false })
        .define("specifications", [
            { name: "engineSize", type: "number" },
            { name: "wheels", type: "number" }
        ]);

###definition

**Returns**: __ - Object

**Params**:  
*   propertyName _String_

    Full name or alias


###set

Set a value on the specified property

**Chainable**: true

**Params**:  
*   property _Thing | Object | String | Array_

    Pass a Thing instance, string to set a single value, an object to set multiple values
*   value _Any_

    


###group

Groups a property

**Chainable**: true

**Params**:  
*   groupName _String_

    The group


###ungroup

**Chainable**: true

**Params**:  
*   String __

    groupName
*   Array __

    [propertyNames]

####Example

    thing.ungroup("video");
    thing.ungroup("video", ["stereo", "channels"]);

###where

returns a new thing instance containing a subset of the properties

**Returns**: __ - Thing

**Params**:  
*   Object __

    filterOptions


###toArray

Returns the set properties as an array suitable for passing to say, Child_Process.

**Returns**: __ - Array

**Params**:  
*   quote _Boolean_

    Set to true to wrap the properties values in double quotes


###unset

**Params**:  
*   propertyName _String_

    unset the property value


###get

**Returns**: _Any_ - Property Value

**Params**:  
*   property _String_

    Property name


###toJSON

**Returns**: _Object_ - Containing property/value pairs

###mixIn

Mix in properties from another thing instance

**Chainable**: true

**Params**:  
*   thing _Thing_

    The thing instance to mix in
*   groups _String | Array_

    The group or groups to put the added properties in


###clone

Returns a copy of the thing instance

**Returns**: __ - Thing

###hasValue

Returns true if the specified property has a value set. If you pass an array, will return
true if at least one of the values is set.

**Returns**: __ - Boolean

**Params**:  
*   properties _Array | String_

    A single, or array of property names

####Example

    thing.hasValue("verbose");
    thing.hasValue([ "verbose", "debug" ]);

#PropertyDefinition

Enforces strict type and value checking on thing properties

##Properties

###value

Gets/sets the property value. Will attempt to convert values to Number for definitions of `type` "number".

**type**: Any

###type

**type**: String | Function

####Example

    thing.define({ name: "name", type: "string" });
    thing.define({ name: "created", type: Date });
    thing.define({ name: "onComplete", type: "function" });
    thing.define({ name: "data", type: JobData });
    thing.define({ name: "properties", type: Object });
    thing.define({ name: "files", type: Array });

###valueTest

A regular expression, function or Array containing one or more of each. A value
must return true for all to be valid.

**type**: Regexp | Function | Array

####Example

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

###valid

**type**: Boolean

###default

The default value to set on instantiation

**type**: Any

###validationMessages

**type**: Array

###groups

tags

**type**: Array

###name

**type**: string

###required

Thing instance will remain invalid until a value is set

**type**: Boolean

###defaultOption

if unnamed values are passed to thing.set(), set them AS AN ARRAY on this property

**type**: Boolean

###alias

**type**: string

###typeFailMsg

**type**: string

###valueFailMsg

**type**: string



[![NPM](https://nodei.co/npm-dl/nature.png?months=3)](https://nodei.co/npm/nature/)
