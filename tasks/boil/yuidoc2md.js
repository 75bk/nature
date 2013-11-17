module.exports = function(handlebars){
    handlebars.registerHelper("yuidoc2md", function(files){
        var yuidoc2md = require("yuidoc2md");
        return yuidoc2md.getMarkdown(files);
    });
};
