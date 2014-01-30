var yuidoc2md = require("yuidoc2md");

var docs = yuidoc2md.getMarkdown("lib/nature.js") + yuidoc2md.getMarkdown("lib/Thing.js") + yuidoc2md.getMarkdown("lib/PropertyDefinition.js");

module.exports = function(grunt){
    grunt.initConfig({
        boil: {
            readme: {
                options: {
                    data: { APIdocs: docs }
                },
                src: "boil/README.hbs",
                dest: "README.md"
            }
        },
        jshint: {
            options: { jshintrc: true },
            all: ['Gruntfile.js', 'lib/*.js', 'test/*.js']
        }
    });

    grunt.loadNpmTasks("grunt-boil");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.registerTask("default", "boil");
};
