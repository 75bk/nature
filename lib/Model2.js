module.exports = Model;

function Model(attributeDefinitions){
    var self = this;
    var values = {};
    if (!attributeDefinitions) throw new Error("Model constructor requires attributeDefinitions");
    attributeDefinitions.forEach(function(attributeDefinition){
        Object.defineProperty(self, attributeDefinition.name, {
            enumerable: true,
            configurable: false,
            get: function(){
                attributeDefinition.type = attributeDefinition.type || String;
                var value = values[attributeDefinition.name];
                if (value === undefined || value === null){
                    return value;
                } else if (attributeDefinition.type === Array && Array.isArray(value)){
                    return value;
                } else {
                    return attributeDefinition.type(value);
                }
            },
            set: function(val){
                values[attributeDefinition.name] = val;
            }
        })
    });
}
