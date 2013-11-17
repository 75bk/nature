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
#nature

Nature, a library to help classify the things (models) in your world (app). Take charge of Nature, design Things that do stuff. 

* Things can be instantiated with data directly from the command line, environment, an object literal or file.
* Once classified, Things can be re-used across your apps
* Removes all input validation code from your app

Synopsis

Enables you to write API methods like: (&#x60;YoungMan&#x60; and &#x60;FlammableCar&#x60; are derivitives of &#x60;Thing&#x60;)

    exports.burnCar = function(arsonist){
        var youngMan = new YoungMan(arsonist);
        if (!youngMan.valid){
            throw new Error(youngMan.validationMessages.join(&quot;\n&quot;));
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

    var outdoors = require(&quot;outdoor-activity&quot;);
    outdoors.burnCar(process.argv);

Then a simple command executes the outdoor activity:

    $ CAR_MAKE=Vauxhall CAR_MODEL=Astra node outdoors.js --name Alfie --age 11 --litres 13 --compassion unknown

See the Thing docs for more detail..

##Properties

###Thing

**type**: Thing

###PropertyDefinition

**type**: PropertyDefinition

#propertyDefinition

Enforces strict type and value checking on config options

##Properties

###value

Gets/sets the property value. Will attempt to convert values to Number for definitions of &#x60;type&#x60; &quot;number&quot;.

**type**: Any

###type

**type**: {String|Function}

####Example

    config.define({ name: &quot;name&quot;, type: &quot;string&quot; }); 
    config.define({ name: &quot;created&quot;, type: Date });
    config.define({ name: &quot;onComplete&quot;, type: &quot;function&quot; });
    config.define({ name: &quot;data&quot;, type: JobData });
    config.define({ name: &quot;options&quot;, type: Object }); 
    config.define({ name: &quot;files&quot;, type: Array });

###valueTest

**type**: {Regexp|Function|Array}

####Example

    config.define({ name: &quot;name&quot;, type: &quot;string&quot;, valueTest: /\w{3}/ })
    config.define({ name: &quot;age&quot;, type: &quot;number&quot;, valueTest: function(value){ return value &gt; 16; } })
    config.define({
        name: &quot;colours&quot;, 
        type: Array, 
        valueTest: [ 
            /red/, 
            function(colours){ 
                return colours.length &gt; 0;
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

if unnamed values are passed to config.set(), set them AS AN ARRAY on this option

**type**: Boolean

###alias

**type**: string

###typeFailMsg

**type**: string

###valueFailMsg

**type**: string

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
 
    var Thing = require(&quot;nature&quot;).Thing;
     
get an instance and start [defining](/classes/Thing.html#method_define)
 
    var youngLad = new Thing()
        .define({ name: &quot;firstname&quot; });
         
    youngLad.firstname = &quot;Geoff&quot;;
    youngLad.car = &quot;Clio&quot;; // Ignored, &#x60;car&#x60; is not yet defined and Thing instances are sealed (object non-extensible, properties non-configurable). 

Add [type](/classes/PropertyDefinition.html#property_type) checking
 
    // additional calls to define() redefine an existing property, or add new property definitions.
    youngLad.define({ name: &quot;firstname&quot;, type: &quot;string&quot; })
        .define({ name: &quot;DOB&quot;, type: Date });
    
    var dob = new Date(&quot;19 Feb 2000&quot;);
    youngLad.DOB = dob; // valid, &#x60;dob&#x60; is an instance of &#x60;Date&#x60;
    youngLad.firstname = dob; // invalid, &#x60;typeof dob&#x60; is not &#x60;&quot;string&quot;&#x60;

Add [value testing](/classes/PropertyDefinition.html#property_valueTest)

    youngLad.define({ name: &quot;gender&quot;, type: &quot;string&quot;, valueTest: /^(male|female)$/ });
    
    youngLad.gender = &quot;man&quot;; // invalid
    youngLad.gender = &quot;male&quot;; // valid
    
[Value tests](/classes/PropertyDefinition.html#property_valueTest) can be a function

    function oldEnough(age){ return age &gt;= 11; }
    youngLad.define({ name: &quot;age&quot;, type: &quot;number&quot;, valueTest: oldEnough });
    
    youngLad.age = 9; // invalid, too young
    
Or an array of tests, which must all pass

    function oldEnough(age){ return age &gt;= 11; }
    function youngEnough(age){ return age &lt;= 19; }
    youngLad.define({ name: &quot;age&quot;, type: &quot;number&quot;, valueTest: [oldEnough, youngEnough] });
    
    youngLad.age = 29; // invalid, too old!

Invalid data doesn&#x27;t throw an error so check the &#x60;valid&#x60; flag and &#x60;validationMessages&#x60;

    if (!youngLad.valid){
        console.log(youngLad.validationMessages); // prints &quot;Invalid age: 22&quot;
    }
    
Add custom validationMessages

    // you could also set &#x60;validFail&#x60; property using &#x60;define&#x60;, either is fine
    youngLad.definition(&quot;age&quot;).validFail = &quot;You must be 16-21&quot;;

    youngLad.set(&quot;age&quot;, 9); // invalid
    console.log(youngLad.validationMessages); // prints &quot;You must be 16-21&quot;

Mix and match..

    var appearance = new Thing()
        .define({ name: &quot;style&quot;, type: &quot;string&quot; })
        .define({ name: &quot;labels&quot;, type: Array });

    youngLad.mixIn(appearance);

Load data in bulk

    youngLad.load({
        firstname: &quot;Paul&quot;,
        age: 19, 
        style: &quot;understated class with a grassroot drizzle&quot;,
        labels: [ &quot;Paul Smith&quot;, &quot;Burberry&quot;, &quot;Nike&quot; ]
    });
 
Besides object literals you can load from the command line, environment or file

    youngLad.load(process.argv);
    youngLad.load(process.env);
    youngLad.load(&quot;./profile.json&quot;);
  
Other ways of retrieving values

    youngLad.toJSON(); // get entire set
    youngLad.where({ group: &quot;primary&quot; }).toJSON(); // get sub-set

##Properties

###definitions

**type**: Object

###valid

**type**: Boolean

###errors

**type**: Array

###options

a list of defined Options

**type**: Array

##Methods

###define

Define an option

**Chainable**: true

**Params**:  
*   groups _String|Array_

    The group or groups to add the new option definition to
*   definitions _Object|PropertyDefinition|Array_

    The new option definitions

####Example

    var vehicleThing = new Thing()
        .define({ name: &quot;maxSpeed&quot;, type: &quot;number&quot;, alias: &quot;m&quot;, valueTest: /\d+/, default: 4 })
        .define({ name: &quot;isTaxed&quot;, type: &quot;boolean&quot;, default: false })
        .define(&quot;specifications&quot;, [
            { name: &quot;engineSize&quot;, type: &quot;number&quot; },
            { name: &quot;wheels&quot;, type: &quot;number&quot; }
        ]);

###getDefinition

**Returns**: __ - Object

**Params**:  
*   optionName _String_

    full name or alias


###set

**Chainable**: true

**Params**:  
*   option _Thing|Object|String|Array_

    Pass a Thing instance, string to set a single value, an object to set multiple values
*   value _Any_

    


###group

Groups an option.

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

    [optionNames]

####Example

    config.ungroup(&quot;video&quot;);
    config.ungroup(&quot;video&quot;, [&quot;stereo&quot;, &quot;channels&quot;]);

###where

returns a new config instance containing a subset of the options

**Returns**: __ - Thing

**Params**:  
*   Object __

    filterOptions


###toArray

Returns the set options as an array suitable for passing to say, Child_Process.

**Returns**: __ - Array

###unset

**Params**:  
*   optionName _String_

    unset the option value


###get

**Returns**: _Any_ - Option Value

**Params**:  
*   option _String_

    Option name


###toJSON

**Returns**: _Object_ - Containing Option/value pairs

###mixIn

Mix in options from another config instance

**Chainable**: true

**Params**:  
*   config _Thing_

    The config instance to mix in
*   groups _String|Array_

    The group or groups to put the added options in


###clone

Returns a copy of the config instance

**Returns**: __ - Thing

###hasValue

Returns true if the specified option has a value set. If you pass an array, will return 
true if at least one of the values is set.

**Returns**: __ - Boolean

**Params**:  
*   options _Array|String_

    A single, or array of option names

####Example

    config.hasValue(&quot;verbose&quot;);
    config.hasValue([ &quot;verbose&quot;, &quot;debug&quot; ]);



[![NPM](https://nodei.co/npm-dl/nature.png?months=1)](https://nodei.co/npm/nature/)

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/c5ed60ded97e6bf11b24cf4d3c41fe97 "githalytics.com")](http://githalytics.com/75lb/nature)
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/75lb/nature/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
