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

    // When Babel adds use-strict to the top of modules, it kills Meteor's
    // "global" objects, those declared in a file without var, which are
    // used to export stuff from packages. So, we blacklist it.
    blacklist: ['useStrict'],

    extensions: ['js'],

    server: {
        modules: 'common',
    },

    // The files section is where we can declare per-file module types.
    // Give the full file path from the root of your app, such as
    // 'client/index.js' or 'app.js' or 'server/main.js'
    files: {
        // Cordova mobile-config.js must use a self-executing module type
        'mobile-config.js': { modules: 'common' },

        // If we use SystemJS on the server side then at least one JS file
        // on the server must use a self-executing (non SystemJS) module format.
        // This is because SystemJS, only registers modules but does not actually
        // execute the code in them. If all server side modules were to use the
        // SystemJS module format then no JS files server-side would be executed.
        // By default, we pick "server/main.js" as the file that will use the
        // CommonJS module format. This file will include a line of JS code, for
        // example `System.import('server/index')`, which executes the code in
        // 'server/index.js'. This default file name can be overridden in babel.json.

        // 'server/main.js': { modules: 'common' }
    },
}

// Get optional custom config from babel.json
var customConfig = getCustomConfig(CONFIG_FILE_NAME);

config = merge(config, customConfig);

// If config.server.startupfile exists, then for SystemJS apps this specifies
// the file that will use the CommonJS module format, to ensure it executes.
// SystemJS wrapped modules do not execute, they only register themselves.
if (config.server && config.server.startupfile) {
    if (!config.files)
        config.files = {};

    if (!config.files[config.server.startupfile])
        config.files[config.server.startupfile] = { modules: 'common' }
}

// Optionally print the loaded config for debugging purposes
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
        var modules;

        // Do we have a special module type defined for this file
        var fileSettings = config.files[inputFile];

        if (fileSettings) {
            // Special module type for this file
            modules = fileSettings.modules;
        }

        // The Meteor server side can have it's own module types
        else if (file._resourceSlot.packageSourceBatch.unibuild.arch === 'os' || inputFile === 'mobile-config.js') {
            modules = config.server.modules;
        }

        // And this is the front-end
        else {
            modules = config.modules;
        }

        // package.js can optionally request that a file not be transpiled...
        if (transpile) {
            if (config.verbose)
                console.log('  ' + inputFile);

            try {
                output = babel.transform(source, {
                    sourceMap: 'inline',
                    stage:     config.stage,
                    filename:  file.getDisplayPath(),
                    modules:   modules,
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
