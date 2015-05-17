Package.describe({
    name:    'pbastowski:angular-babel',
    summary: 'Write javascript ES6 in your Angular-Meteor app',
    version: '0.1.4',
    git:     'https://github.com/pbastowski/angular-meteor-babel.git'
});


Package.registerBuildPlugin({
    name:            'compile6to5',
    use:             [],
    sources:         [
        'plugin/compile-6to5.js'
    ],
    npmDependencies: {
        'babel-core':  '5.4.3',
        'ng-annotate': '0.15.4'
    }
});

Package.onUse(function (api) {
    api.versionsFrom('1.0.2.1');

    api.addFiles('lib/core-js-no-number.js');
    // runtime
    api.addFiles('lib/runtime.js');
});

Package.onTest(function (api) {
    api.use(['pbastowski:angular-babel', 'tinytest']);
    api.addFiles([
        'tests/basic_test.es6.js'
    ], ['client', 'server']);
});
