***library under construction***

Nature
======
Nature provides a base class (`Thing`) to enable more accurate classification of the things (DatabaseConfig, VideoFileList, YoungMan, FlammableCar etc.) in your world (function or app). These Things can be reused, subclassed or merged with other Things to create new hybrids. The `Thing` class, when subclassed/instantiated adds useful features to each new object:

* Fine-grained type and value validation per property
* Direct command line, environment, external file or object literal loading capability
* Merging and cloning
* property grouping and filtering
* mechanism for duck typing

Synopsis
--------

Enables you to write an API method like: (`YoungMan` and `FlammableCar` are derivitives of `Thing`)
```javascript
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
            youngMan.igniteCar(car);
        }
    }
}
```
Client code for the above is straight forward, input taken directly from the command line
```javascript
var outdoors = require("outdoor-activity");
outdoors.burnCar(process.argv);
```
Then a simple command executes the outdoor activity:
```sh
$ CAR_MAKE=Vauxhall CAR_MODEL=Astra node outdoors.js --name Alfie --age 11 --litres 13 --compassion unknown
```
See the Thing docs for more detail.. 
