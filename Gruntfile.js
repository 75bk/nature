var yuidoc2md = require("yuidoc2md");

module.exports = function(grunt){
    grunt.initConfig({
        boil: {
            readme: {
                options: {
                    templateData: {
                        APIdocs: yuidoc2md.getMarkdown(grunt.file.expand("lib/*.js"))
                    }
                },
                create: { 
                    name: "README.md",
                    content: grunt.file.read("tasks/boil/readme.hbs")
                }
            }
        }
    });
    
    grunt.loadNpmTasks("grunt-boil");    
    grunt.registerTask("default", "boil");
};
