/**
Classify, load and pass validated sets of configuration data around your application.

@class config-master
@module config-master
@static
*/

var Config = require("./config"),
    OptionDefinition = require("./optionDefinition"),
    _ = require("underscore");

/**
The Config class
@property Config
@type Config
*/
exports.Config = Config;

/**
The Option Definition class
@property OptionDefinition
@type OptionDefinition
*/
exports.OptionDefinition = OptionDefinition;