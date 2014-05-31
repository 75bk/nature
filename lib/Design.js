var Model = require("./Model2");

module.exports = Design;

function Design(attributeDefinitions){
    if (!(this instanceof Design)) return new Design(attributeDefinitions);
    
    this._attributeDefinitions = attributeDefinitions;
}

Design.prototype.create = function(){
    return new Model(this._attributeDefinitions);
};
Design.prototype.define = function(){};
Design.prototype.load = function(){};
Design.prototype.group = function(){};
Design.prototype.groups = function(){};
Design.prototype.ungroup = function(){};
Design.prototype.where = function(){};
