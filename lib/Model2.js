module.exports = Model;

function Model(attributeDefinitions){
    var self = this;
    var values = {};
    attributeDefinitions.forEach(function(attributeDefinition){
        Object.defineProperty(self, attributeDefinition.name, { 
            enumerable: true, 
            configurable: false, 
            get: function(){
                return this.type(values[attributeDefinition.name]);
            },
            set: function(val){
                values[attributeDefinition.name] = val;
            }
        })
    });
}
