***library under construction***

Nature
======
A library to help classify the things (models) in your world (app) and how they interact.

Synopsis
--------

Enables you to write API methods like: (`YoungMan` and `FlammableCar` are derivitives of `Thing`)
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
