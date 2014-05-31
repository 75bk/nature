var Model = require("./Model2"),
    w = require("wodge");

module.exports = Design;

function Design(attributes){
    if (!(this instanceof Design)) return new Design(attributes);
    
    this._attributes = [];
    if (attributes){
        if (attributes.every(function(group){ return "groups" in group; })){
            var groups = attributes;
            for (var i = 0; i < groups.length; i++){
                this.define(groups[i].attributes, { groups: groups[i].groups });
            }
        } else if (attributes.every(function(attribute){ return "name" in attribute; })){
            this.define(attributes);
        } else {
            console.dir(attributes);
            throw new Error("Bad attribute data");
        }
    }
}

Design.prototype.create = function(){
    return new Model(this._attributes);
};
Design.prototype.define = function(attribute, options){
    if (Array.isArray(attribute)) {
        for (var i = 0; i < attribute.length; i++){
            this.define(attribute[i], options);
        }
        return;
    }
    
    if (options) {
        attribute.groups = w.arrayify(options.groups);
    }
    this._attributes.push(attribute);
};
Design.prototype.load = function(){};
Design.prototype.group = function(){};
Design.prototype.groups = function(){};
Design.prototype.ungroup = function(){};
Design.prototype.where = function(){};
