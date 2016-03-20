Package.describe({
    name:    "pbastowski:angular-babel",
    summary: "Babel compiler and ng-annotate for Meteor 1.2",
    version: "1.3.0",
    git:     "https://github.com/pbastowski/angular-meteor-babel.git"
});

Package.registerBuildPlugin({
    name:            'compileNGScript',
    sources:         [
        'plugin/ng-script-compiler.js'
    ],
    npmDependencies: {
        'babel-core':  '5.8.35',
        'ng-annotate': '1.2.1'
    }
});

Package.onUse(function (api) {
    api.versionsFrom('METEOR@1.3-rc.3');

    api.use('isobuild:compiler-plugin@1.0.0'); // Used for compilers
    api.use('modules'); // Used for compilers

    // Files to load in Client only.
    api.addFiles([

        // Babel files
        'lib/core-js-no-number.js',
        'lib/runtime.js',

        // The custom version of browser-polyfill.js removes the check
        // if it has already been run. I need this version to run and to
        // overwrite Meteor's bundled version, which is loaded in  memory.
        // Meteor's version does NOT include the async function helpers.
        'lib/browser-polyfill.js',

        // Need this to support es7 async functions and generators
        //'.npm/plugin/compileNGScript/node_modules/babel-core/browser-polyfill.js',

    ], ['client', 'server'], { transpile: false });
});

Package.onTest(function (api) {
});
