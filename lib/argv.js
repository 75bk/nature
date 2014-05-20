module.exports = parse;

/**
@returns {Object}
*/
function parse(argv, expectArgs){
    var arg;
    var shortArg = /-\w/;
    var longArg = /--\w+/;
    var output = {};
    argv = argv === process.argv ? argv.slice(2) : argv.slice(0);
    
    while (typeof(arg = argv.shift()) !== "undefined"){
        console.log(arg);
        if (longArg.test(arg)){
            
        }
    }
}

