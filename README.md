# Angular Meteor Babel

If you are not using anguar-meteor then look at grigio:babel instead. This package is only to be used with angular-meteor.

## Why pbastowski:angular-babel?
This package is a direct copy of the grigio:babel package with the only change being the addition of ng-annotate, which runs immediately after babel finishes transpiling each of your .es6 files. Please give your files the .es6 extension, not .ng.js, as .ng.js files are already catered for by the angular-meteor package itself.

The reason I created this package is because Meteor currently only allows us to associate one plugin per file extension. Thus, either Babel or ng-annotate can pre-process your .es6 files, but not both. So, if using the grigio:babel package, you can have your ES6 files converted to ES5 files with an .es6.js extension. But, they would not be annotated with ng-annotate, which kinda sucks.

## Introduction

Write javascript ES6 (http://git.io/es6features) in your Angular Meteor app. A port of the [Babel](https://babeljs.io) transpiler (previosly known as 6to5).

It also includes the `runtime` and `core-js` (without ES6 Number) in `lib/` to support features like function generators, sets,..
 
## Installation
 
```
meteor add pbastowski:angular-babel
```

## Configuration (optional)

You can override the default config, just create a `babel.json` file in your project and override the default behavior. Then restart `meteor` to apply.

```
{
  "debug": false,                         // print loaded config
  "verbose": true,                        // print active file extensions
  "extensions": ['es6.js', 'es6', 'jsx'], // babel managed extensions
  "stage": 0                              // experimental ES7 support
}

```
*NOTE*: If you use `reactjs:react` you must create `babel.json` and remove `jsx` from your `extensions`, to avoid `JSX` compilation conflict.

```
{
...
  "extensions": ['es6.js', 'es6'], // .jsx is compiled via react-tools in this case
...
}
```

## Known issues

Some ES6 ES7 features aren't available

- import / export [#9](https://github.com/grigio/meteor-babel/issues/9)
- Number [#5](https://github.com/grigio/meteor-babel/issues/5)

## Tests

Inside this package:

```
meteor test-packages ./ # or spacejam test-packages ./
```


### License

Copyright (C) 2014 Luigi Maselli - http://grigio.org - MIT Licence
