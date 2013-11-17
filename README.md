***library under construction***

[![NPM version](https://badge.fury.io/js/nature.png)](http://badge.fury.io/js/nature)

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
#PropertyDefinition

Enforces strict type and value checking on config options

##Properties 

### value

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>value</td><td><em>Any</em></td><td>Gets/sets the property value. Will attempt to convert values to Number for definitions of &#x60;type&#x60; &quot;number&quot;.</td>
    </tr>
</table>

### type

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>type</td><td><em>{String|Function}</em></td><td></td>
    </tr>
</table>

#### Example

    config.define({ name: "name", type: "string" }); 
    config.define({ name: "created", type: Date });
    config.define({ name: "onComplete", type: "function" });
    config.define({ name: "data", type: JobData });
    config.define({ name: "options", type: Object }); 
    config.define({ name: "files", type: Array });

### valueTest

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>valueTest</td><td><em>{Regexp|Function|Array}</em></td><td></td>
    </tr>
</table>

#### Example

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

### valid

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>valid</td><td><em>Boolean</em></td><td></td>
    </tr>
</table>

### default

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>default</td><td><em>Any</em></td><td>The default value to set on instantiation</td>
    </tr>
</table>

### validationMessages

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>validationMessages</td><td><em>Array</em></td><td></td>
    </tr>
</table>

### groups

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>groups</td><td><em>Array</em></td><td>tags</td>
    </tr>
</table>

### name

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>name</td><td><em>string</em></td><td></td>
    </tr>
</table>

### required

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>required</td><td><em>Boolean</em></td><td>Thing instance will remain invalid until a value is set</td>
    </tr>
</table>

### defaultOption

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>defaultOption</td><td><em>Boolean</em></td><td>if unnamed values are passed to config.set(), set them AS AN ARRAY on this option</td>
    </tr>
</table>

### alias

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>alias</td><td><em>string</em></td><td></td>
    </tr>
</table>

### typeFailMsg

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>typeFailMsg</td><td><em>string</em></td><td></td>
    </tr>
</table>

### valueFailMsg

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>valueFailMsg</td><td><em>string</em></td><td></td>
    </tr>
</table>

#Thing

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
     
get an instance and start [defining](/classes/Thing.html#method_define)
 
    var youngLad = new Thing()
        .define({ name: "firstname" });
         
    youngLad.firstname = "Geoff";
    youngLad.car = "Clio"; // Ignored, `car` is not yet defined and Thing instances are sealed (object non-extensible, properties non-configurable). 

Add [type](/classes/PropertyDefinition.html#property_type) checking
 
    // additional calls to define() redefine an existing property, or add new property definitions.
    youngLad.define({ name: "firstname", type: "string" })
        .define({ name: "DOB", type: Date });
    
    var dob = new Date("19 Feb 2000");
    youngLad.DOB = dob; // valid, `dob` is an instance of `Date`
    youngLad.firstname = dob; // invalid, `typeof dob` is not `"string"`

Add [value testing](/classes/PropertyDefinition.html#property_valueTest)

    youngLad.define({ name: "gender", type: "string", valueTest: /^(male|female)$/ });
    
    youngLad.gender = "man"; // invalid
    youngLad.gender = "male"; // valid
    
[Value tests](/classes/PropertyDefinition.html#property_valueTest) can be a function

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

##Properties 

### definitions

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>definitions</td><td><em>Object</em></td><td></td>
    </tr>
</table>

### valid

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>valid</td><td><em>Boolean</em></td><td></td>
    </tr>
</table>

### errors

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>errors</td><td><em>Array</em></td><td></td>
    </tr>
</table>

### options

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>options</td><td><em>Array</em></td><td>a list of defined Options</td>
    </tr>
</table>

##Methods

###define

Define an option

**Chainable**: true

**Params**:
<table>
    <tr>
        <th>Name</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>groups</td><td><em>String|Array</em></td><td>The group or groups to add the new option definition to</td>
    </tr>
    <tr>
        <td>definitions</td><td><em>Object|PropertyDefinition|Array</em></td><td>The new option definitions</td>
    </tr>
</table>


####Example

    var vehicleThing = new Thing()
        .define({ name: "maxSpeed", type: "number", alias: "m", valueTest: /\d+/, default: 4 })
        .define({ name: "isTaxed", type: "boolean", default: false })
        .define("specifications", [
            { name: "engineSize", type: "number" },
            { name: "wheels", type: "number" }
        ]);

###getDefinition

**Returns**: __ - Object

**Params**:
<table>
    <tr>
        <th>Name</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>optionName</td><td><em>String</em></td><td>full name or alias</td>
    </tr>
</table>


###set

**Chainable**: true

**Params**:
<table>
    <tr>
        <th>Name</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>option</td><td><em>Thing|Object|String|Array</em></td><td>Pass a Thing instance, string to set a single value, an object to set multiple values</td>
    </tr>
    <tr>
        <td>value</td><td><em>Any</em></td><td></td>
    </tr>
</table>


###group

Groups an option.

**Chainable**: true

**Params**:
<table>
    <tr>
        <th>Name</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>groupName</td><td><em>String</em></td><td>The group</td>
    </tr>
</table>


###ungroup

**Chainable**: true

**Params**:
<table>
    <tr>
        <th>Name</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>String</td><td><em></em></td><td>groupName</td>
    </tr>
    <tr>
        <td>Array</td><td><em></em></td><td>[optionNames]</td>
    </tr>
</table>


####Example

    config.ungroup("video");
    config.ungroup("video", ["stereo", "channels"]);

###where

returns a new config instance containing a subset of the options

**Returns**: __ - Thing

**Params**:
<table>
    <tr>
        <th>Name</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>Object</td><td><em></em></td><td>filterOptions</td>
    </tr>
</table>


###toArray

Returns the set options as an array suitable for passing to say, Child_Process.

**Returns**: __ - Array

###unset

**Params**:
<table>
    <tr>
        <th>Name</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>optionName</td><td><em>String</em></td><td>unset the option value</td>
    </tr>
</table>


###get

**Returns**: _Any_ - Option Value

**Params**:
<table>
    <tr>
        <th>Name</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>option</td><td><em>String</em></td><td>Option name</td>
    </tr>
</table>


###toJSON

**Returns**: _Object_ - Containing Option/value pairs

###mixIn

Mix in options from another config instance

**Chainable**: true

**Params**:
<table>
    <tr>
        <th>Name</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>config</td><td><em>Thing</em></td><td>The config instance to mix in</td>
    </tr>
    <tr>
        <td>groups</td><td><em>String|Array</em></td><td>The group or groups to put the added options in</td>
    </tr>
</table>


###clone

Returns a copy of the config instance

**Returns**: __ - Thing

###hasValue

Returns true if the specified option has a value set. If you pass an array, will return 
true if at least one of the values is set.

**Returns**: __ - Boolean

**Params**:
<table>
    <tr>
        <th>Name</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>options</td><td><em>Array|String</em></td><td>A single, or array of option names</td>
    </tr>
</table>


####Example

    config.hasValue("verbose");
    config.hasValue([ "verbose", "debug" ]);

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

### Thing

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>Thing</td><td><em>Thing</em></td><td></td>
    </tr>
</table>

### PropertyDefinition

<table>
    <tr>
        <th>Property</th><th>Type</th><th>Description</th>
    </tr>
    <tr>
        <td>PropertyDefinition</td><td><em>PropertyDefinition</em></td><td></td>
    </tr>
</table>



[![NPM](https://nodei.co/npm-dl/nature.png?months=1)](https://nodei.co/npm/nature/)

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/c5ed60ded97e6bf11b24cf4d3c41fe97 "githalytics.com")](http://githalytics.com/75lb/nature)
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/75lb/nature/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
