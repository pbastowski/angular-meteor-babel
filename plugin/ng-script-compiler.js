var babel = Npm.require('babel-core');
var ngAnnotate = Npm.require('ng-annotate');

var config = {
    // print loaded config
    'debug':   false,
    
    // print active file extensions
    'verbose': true,
    
    // experimental ES7 support
    'stage':   0,
    
    // what module system to use
    'modules': 'common',
    
    // When Babel adds use-strict it kills Meteor's "global" objects
    // that is, those declared in a file with out var. So, we blacklist it.
    blacklist: ['useStrict'],
}

var processFiles = function (files) {
    console.log('\nBabel compiling files:');
    files.forEach(processFile);
};

var fileContentsCache = {  };

var processFile = function (file) {

    var inputFile = file.getPathInPackage();
    var source = file.getContentsAsString();
    var outputFile = Plugin.convertToStandardPath(file.getPathInPackage());
    var moduleName = outputFile.replace('.js', '');
    var output = "";

    // Get file previous and current file contents hashes
    var lastHash = fileContentsCache[inputFile] && fileContentsCache[inputFile].hash;
    var currentHash = file.getSourceHash();

    var transpile = file._resourceSlot.inputResource.fileOptions.transpile;
    transpile = transpile || typeof transpile === 'undefined';
    
    // Only compile files that have changed since the last run
    if ( !lastHash || lastHash !== currentHash ) {
        
        if (transpile) {
            console.log('  ' + inputFile);

            try {
                output = babel.transform(source, {
                    // The blacklisting of "userStrict" is required to support
                    // Meteor's file level declarations that Meteor can export
                    // from packages.
                    sourceMap: true,
                    stage:     config.stage,
                    filename:  file.getDisplayPath(),
                    modules:   config.modules,
                    blacklist: config.blacklist
                }).code;
            } catch (e) {
                console.log(e); // Show the nicely styled babel error
                return file.error({
                    message: 'Babel transform error',
                    line:    e.loc.line,
                    column:  e.loc.column
                });
            }

            var annotated = ngAnnotate(output, {
                add: true
            });
    
            if (annotated.errors) {
                throw new Error(annotated.errors.join(': \n\n'));
            }
            
            output = annotated.src;
        
        } else {
            output = source;
        }
        
        // Update the code cache
        fileContentsCache[inputFile] = {hash: currentHash, code: output};

    } else {
        // Pull the code from the cache
        output = fileContentsCache[inputFile].code ;
    }

    file.addJavaScript({
        data: output,
        path: outputFile
    });
};

Plugin.registerCompiler({
    extensions: ['js'],
    filenames:  []

}, function () {
    return {processFilesForTarget: processFiles};
});
