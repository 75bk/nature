/* in the style of an MVC controller.. or Presenter..  */

/* model */
var cat = new Cat({
    name: "Meow",
    colour: "ginger",
    personality: "calm"
})

Cat.load(cat, "http://localhost:3000/cat/1");

/* view.. input: model, output: DOM */
function CatView(cat, element){
    var self = this;
    this.name;
    this.colourSelect;
    this.cat = cat;
 
    this.render = = function(){
        this.body = this.template.render(this.cat);
    }
}
var view = new CatView()

/* controller.. input: DOM, output: Model */
function CatController(element, cat){
    element.name.attachEventListener("change", function(){
        cat.name = this.value;
    });
    
}
var controller = new CatController(element){}
cat.name.on("update", view.setName);
cat.colour.on("update", view.setColour);
