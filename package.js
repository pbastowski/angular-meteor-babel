Package.describe({
    name:    'pbastowski:angular-babel',
    summary: 'Write javascript ES6 in your Angular-Meteor app',
    version: '0.1.5',
    git:     'https://github.com/pbastowski/angular-meteor-babel.git'
});


Package.registerBuildPlugin({
    name:            'compile6to5',
    use:             [],
    sources:         [
        'plugin/compile-6to5.js'
    ],
    npmDependencies: {
        'babel-core':  '5.4.7',
        'ng-annotate': '1.0.0'
    }
});

Package.onUse(function (api) {
    api.versionsFrom('1.0.2.1');

    api.addFiles('lib/core-js-no-number.js');
    // runtime
    api.addFiles('lib/runtime.js');

    // watch for changes in the config file and rebuild
    api.add_files(['../../babel.json'], 'server');
});

Package.onTest(function (api) {
    api.use(['pbastowski:angular-babel', 'tinytest']);
    api.addFiles([
        'tests/basic_test.es6.js'
    ], ['client', 'server']);
});
