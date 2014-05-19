/* in the style of an MVC controller.. or Presenter..  */

var nature = require("nature");

/* no constructor, therefore use default constructor which loads data */
var Cat = nature.design({
    attributes: [
        { name: "name" },
        { name: "colour" },
        { name: "personality", test: /calm|aggressive|afraid/ }
    ]
})
var Cat = nature.design("http://localhost:3000/cat/design")

/* loading data */
var cat = new Cat({
    name: "Meow",
    colour: "ginger",
    personality: "calm"
})

Cat.load(cat, "http://localhost:3000/cat/1");
Cat.load(cat, { name: "tabby" })
argv.load(cat, [ "--name", "tabby", "-c", "white" ]);




function CatView(cat){
    var self = this;
    this.cat = cat;
    this.cat.on("update", function(prop, new, old){
        self.render();
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

