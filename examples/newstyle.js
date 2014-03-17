/*
nature module knows about all creatures great and small.. nature creates and nature can taketh away.
nature like a registry of instances.. a business layer.. instances can talk to each other, locally and remotely.. there is an environment, a singleton god-object all model instances know about. 

don't throw on error, throw when trying to access a broken model.

*/

var Recipe = nature.design(
    { name: "ingredients", array: Object },
    { name: "dishType", scalar: "string" },
    { name: "region", scalar: "string" },
    { name: "method", array: "string" },
    { name: "cook", type: "function", value: function(){
        // cook shit, yeah?
    }}
);

/* Create, load data */
var sauce = new Receipe(data);
sauce._load(data);
nature.load(sauce, data);

/* Test valid */
if (nature.valid(sauce){

});
// OR
if (sauce._valid){

} else {
    log(sauce._errorLog)
}

/* variants */
var Caracciera = nature.variant(Recipe, [
    { name: "region", criteria: /napoli|naples/i },
    { name: "onion", criteria: 1 },
    { name: "choppedTomatoCans", criteria: 1 },
    { name: "garlic", criteria: 2 }
]);

/* mixture */
var RedSauce = nature.variant(Caracciera, Basil)

/* grouping */
var HandbrakeOptions = nature.design([
        { group: "general", attributes: [
            { name: "help", type: "boolean", alias: "h" },
            { name: "verbose", type: "boolean", alias: "v" },
            { name: "input", type: "string", alias: "i" },
        ]},
        { group: "source", attributes: [
            { name: "title", type: "number", alias: "t" },
            { name: "min-duration", type: "number" },
            { name: "scan", type: "boolean" },
        ]}
    ]
);


// example: Bigot Machine, change person attributes, state event fires ("four-eyed speccy twat/jerk")
