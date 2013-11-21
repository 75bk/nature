/**
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

@class nature
@static
*/


/**
@property Thing
@type Thing
*/
exports.Thing = require("./Thing");

/**
@property PropertyDefinition
@type PropertyDefinition
*/
exports.PropertyDefinition = require("./PropertyDefinition");