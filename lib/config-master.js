/**
Classify, load and pass validated sets of configuration.

* load and store config from the command line, environment or external file
* classify and reuse config sets (some config sets, e.g. "version", "dry-run", "verbose" etc. have many applications)
* protect your API methods from invalid input
* Remove input argument validation code from your API. 

Synopsis

Simplistic example use in a Node Module: 

    var Config = require("config-manger").Config;
    
    // API
    exports.encode = encode;
    
    // Encode method
    function encode(options){
        var config = encode.config.load(options);
        
        if (config.valid){
            config.get("files").forEach(processFile);
        } else {
            throw new Error(config.errors.toString());
        }
    }
    
    // Encode config definition
    encode.config = new Config()
        .define({ name: "files", type: Array, valueTest: function(files){
            return files.every(fs.existsSync);
        }})
        .define({ name: "verbose", type: "boolean", default: true });


You could write client code like: 
    
    var api = require("./exampleModule");
    
    // assuming the files exist, outputs 'processing.. '
    api.encode({ files: [ "huge cars.avi", "mallets and wallets.wmv", "umpteen beans.flv" ] });

Writing a CLI client is as simple as:

    api.encode(process.argv);
    
Using Config Master, your API methods are as simple to call as:

    api.encode({ max-width: 960, audio: "stereo", quality: 22, srt-file: "dog gone.srt" })
    api.encode(process.argv); // parse command line
    api.launchServer("./production-config.json"); // load external file
    api.launchServer(process.env); // load from environment

Or a combination of all 4

    var config = api.launchServer.config
        .load("./production-config.json")
        .load(process.env)
        .load(process.argv)
        .load({ user: "75lb" });

    api.launchServer(config);    

In the library, define your configuration sets



@class config-master
@module config-master
@static
*/

var Config = require("./config"),
    OptionDefinition = require("./optionDefinition"),
    _ = require("underscore");

/**
@property Config
@type Config
*/
exports.Config = Config;

/**
@property OptionDefinition
@type OptionDefinition
*/
exports.OptionDefinition = OptionDefinition;