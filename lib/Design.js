var Model = require("./Model2");

module.exports = Design;

function Design(attributes){
    if (!(this instanceof Design)) return new Design(attributes);
    
    this._attributes = attributes;
}

Design.prototype.create = function(){
    return new Model(this._attributes);
};
Design.prototype.define = function(attribute, options){

};
Design.prototype.load = function(){};
Design.prototype.group = function(){};
Design.prototype.groups = function(){};
Design.prototype.ungroup = function(){};
Design.prototype.where = function(){};
