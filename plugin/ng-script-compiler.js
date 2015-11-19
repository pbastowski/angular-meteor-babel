var babel = Npm.require('babel-core');
var ngAnnotate = Npm.require('ng-annotate');

var CONFIG_FILE_NAME = 'babel.json';

var config = {
    // print loaded config
    'debug':   false,

    // print active file extensions
    'verbose': false,

    // experimental ES7 support
    'stage':   0,

    // what module system to use
    'modules': 'common',

    // When Babel adds use-strict it kills Meteor's "global" objects
    // that is, those declared in a file with out var. So, we blacklist it.
    blacklist: ['useStrict'],

    extensions: ['js']
}

// Get optional custom config from .babelrc
var customConfig = getCustomConfig(CONFIG_FILE_NAME);

config = merge(config, customConfig);

// Optionally pring the loaded config for debugging purposes
if (config.debug)
    console.log('\nBabel config:\n', JSON.stringify(config, null, 4));

var processFiles = function (files) {
    if (config.verbose)
        console.log('\nBabel compiling files:');
    files.forEach(processFile);
};

var fileContentsCache = {  };

var processFile = function (file) {

    var inputFile = file.getPathInPackage();
    var source = file.getContentsAsString();
    var outputFile = Plugin.convertToStandardPath(file.getPathInPackage());
    var moduleName = inputFile.replace(/\\/g, '/').replace('.js', '');
    var output = "";

    // Get file previous and current file contents hashes
    var lastHash = fileContentsCache[inputFile] && fileContentsCache[inputFile].hash;
    var currentHash = file.getSourceHash();

    var transpile;
    if (file._resourceSlot.inputResource.fileOptions)
      transpile = file._resourceSlot.inputResource.fileOptions.transpile;

    transpile = transpile || typeof transpile === 'undefined';

    // Only compile files that have changed since the last run
    if ( !lastHash || lastHash !== currentHash ) {

        if (transpile) {
            if (config.verbose)
                console.log('  ' + inputFile);

            try {
                output = babel.transform(source, {
                    // The blacklisting of "userStrict" is required to support
                    // Meteor's file level declarations, which Meteor can export
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

        // For SystemJS add a module name, so we can use SystemJS to import the file by name.
        if (/system/i.test(config.modules)) {
            output = output.replace("System.register([", 'System.register("' + moduleName + '",[');
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
    extensions: config.extensions,
    filenames:  []

}, function () {
    return {processFilesForTarget: processFiles};
});

function getCustomConfig(configFileName) {
    var path = Plugin.path;
    var fs = Plugin.fs;

    var appdir = process.env.PWD || process.cwd();
    var custom_config_filename = path.join(appdir, configFileName);
    var userConfig = {};

    if (fs.existsSync(custom_config_filename)) {
        userConfig = fs.readFileSync(custom_config_filename, {encoding: 'utf8'});
        userConfig = JSON.parse(userConfig);
    }
    return userConfig;
}

function merge (destination, source) {
    for (var property in source)
        destination[property] = source[property];
    return destination;
}
