/**
Config-Master ("Kong Fig Master") is here to chaperone options visiting from the CLI, external file or environment throughout your application. There will be no funny business.

@class config-master
@module config-master
@static
*/

var Config = require("./config"),
    OptionDefinition = require("./optionDefinition"),
    _ = require("underscore");

/**
@class ConfigFactory
@constructor
*/
function Configs(){
    var _configs = {};

    /**
    @method add
    @param {String} name A name for this Config
    @param {Config|String|Array} config The Config instance to add
    @example
        configMaster.add(
            "dimensions",
            new Config()
                .define({ name: "width", alias: "w", type: "number", default: 640 })
                .define({ name: "height", alias: "h", type: "number", default: 480 })
        );
        
        configMaster.add(
            "audio", 
            new Config()
                .define({ name: "type", alias: "m", type: "string", default: "stereo" })
                .define({ name: "kbs", alias: "k", type: "number", default: 192 })
        );
        
        configMaster.add("video", ["dimensions", "audio"]);
        
    */
    this.add = function(name, config){
        var self = this;
        
        // add(configName, existingConfigNameToClone)
        if (typeof config === "string"){
            if (_configs[config]){
                _configs[name] = _configs[config].clone();
                _configs[name].group(name);
            } else {
                throw new Error("config doesn't exist: " + config);
            }

        // add(configName, configInstance)
        } else if (config instanceof Config) {
            _configs[name] = config;

        // add(configName, existingConfigsToMergeIn)
        } else if (_.isArray(config)){
            var newConfig = new Config();
            config.forEach(function(configName){
                var existingConfig = _configs[configName]; 
                if (existingConfig){
                    newConfig.mixIn(existingConfig, configName);
                } else {
                    throw new Error("config doesn't exist: " + conf);
                }
            });
            self.add(name, newConfig);
        } else {
            throw new Error("unrecognised config type: " + config);
        }
        return this;
    }

    /**
    @method get
    @param {String} name
    @param {Object|Config} options Values to set on the Config returned (Hash or Config instance)
    @return {Config}
    */
    this.get = function(name, options){
        if (options){
            return this.get(name).set(options);
        } else {
            return _configs[name];
        }
    }
    
    /**
    @method list
    */
    this.list = function(){
        return _configs;
    }
}

exports.Config = Config;
exports.Configs = Configs;
exports.OptionDefinition = OptionDefinition;