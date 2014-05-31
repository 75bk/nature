var Model = require("./Model2"),
    w = require("wodge");

module.exports = Design;

function Design(attributes){
    if (!(this instanceof Design)) return new Design(attributes);
    
    this._attributes = [];
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
