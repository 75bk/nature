var nature = require("nature");

/* no constructor, therefore use default constructor which loads data */
var Cat = nature.create({
    attributes: [
        { name: "name" },
        { name: "colour" },
        { name: "personality", test: /calm|aggressive|afraid/ }
    ]
})

function CatView(cat){
    var self = this
    this.cat = cat
    this.cat.on("update", function(prop, new, old){
        self.render();
    })
    Cat.observe(cat, function(changes){
        
    })
}
CatView.prototype.render = function(){
    this.body = this.template.render(this.cat);
}

var cat = new Cat({
    name: "Meow",
    colour: "ginger",
    personality: "calm"
})
var view = new CatView(cat)

