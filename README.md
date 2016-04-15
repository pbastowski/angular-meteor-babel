# Babel and ng-annotate in one package

This package is meant to be used with AngularJS and Meteor.  For a great implementation of AngularJS on the Meteor platform please see [Angular-Meteor](http://angular-meteor.com) and the corresponding `angular` package.

If you are not working with angular-meteor then consider using Meteor's own `ecmascript` package. However, if you do need the extra bits of goodness that this package provides over and above what `ecmascript` does, then it's ok to use this package also. Even if you're not using AngularJS, it will not harm your code.

## Install

```bash
meteor add pbastowski:angular-babel
```

## What's in this package that's not in the ecmascript package?

Here is the list of Babel transformers in this package that are not in the `ecmascript` package:

- es5.properties.mutators 
- es6.modules 
- es6.regex.sticky
- es6.regex.unicode 
- es6.tailCall
- es6.templateLiterals 
- es7.decorators (stage 1)
- es7.classProperties (stage 0)
- es7.exportExtensions (stage 1)
- es7.comprehensions (stage 0)
- es7.asyncFunctions (stage 2)
- es7.doExpressions (stage 0)
- es7.exponentiationOperator (stage 3)

Please note that all es7 transformers are considered experimental, especially those at Stage 0 and 1. 


## Custom configuration with babel.json

Place `babel.json` at the root of your project to override certain default settings. This file is completely optional and may contain the following in JSON format. The values below are the default configuration.

```
{
    "verbose": false,     // true shows files being compiled
    "debug": false,       // true displays this config file
    "modules": "common",  // what module format Babel should use. See 
                          // Babel documentation for "modules" option.
    "blacklist": ['useStrict'],  // Do not change this unless you know
                                 // very well what you are doing.
    "stage": 0,            // see Babel documentation for stage option.
    "extensions": ["js"]   // "js" means compile all ".js" files.
}
```

> If you are using Meteor 1.3 then please ignore the Meteor 1.2 and SYstemJS sections, below. Instead, read Meteor 1.3 documentation about "modules".

# Meteor 1.2 and below

## Using `import ... from`

> Meteor 1.2 only

If you are using Meteor 1.3 then please ignore this section and any notes about SystemJS further below. Instead, read Meteor 1.3 docs about modules.

Babel does not include a module loader, so statements such as below, will not work out of the box
 
```javascript
import {x, y, z} from "modulename";
```

However, if your `modules` setting is `{ "modules": "system" }` then we can use `pbastowski:systemjs` to load modules compiled with Babel. For CommonJS modules, which is the default "modules" setting, we can use `pbastowski:require`.

### SystemJS

> Meteor 1.2 only

So, you have configured Babel through `babel.json` to output SystemJS modules, like this: 

    { "modules": "system" }
    
Well done! Now you need to know how to use these modules in your code. 

SystemJS modules are assigned a name based on their file name within your project. Below are some examples that show how a file name is converted to a module name, which you can import:
 
file name | module name
----------|------------
client/app/app.js | client/app/app
client/feature1/feature1.js | client/feature1/feature1
client/feature1/lib/xxx.js | client/feature1/lib/xxx
client/lib/angular-messages.min.js | client/lib/angular-messages.min

#### Add SystemJS to your Meteor project

    meteor add pbastowski:systemjs
 
#### Use `System.import` to kick off your app

Next, in the body section of your `index.html` file you need to import the JS file that kicks off your application. For our example that file is `client/index.js`.

```html
<head>
    <title>My App</title>
</head>
<body>
    <app>Loading...</app>
    <script>
        System.import('client/index');
    </script>
</body>
```

Below is a sample `client/index.js` file. Remember that the innermost imports, those inside `app` and `feature1`, will be executed first. Then, the rest of the code in `index.js` will be executed in the order it is listed in the file. 

In the example below, first `client/app/app` will be imported and executed followed by `client/feature1/feature1`.


```javascript
import 'client/app/app';
import 'client/feature1/feature1';
```

### CommonJS, the Meteor 1.3 default for modules

When the module format is `common`, which is the default for this Babel plugin, you don't actually have to do anything special as long as you don't `import` or `export` in your ES6 files. Babel will compile your code and output files that will be loaded and executed just like any normal non-compiled JS files would be.

#### But I really want to import and export

With Meteor 1.2, if you use `import ... from` or `export` syntax in your ES6 code you may see errors in your dev console complaining about a missing `require`. To get around that, I have created the package `pbastowski:require`, which implements just enough of `require` and `module.exports` to enable you to export and import in Meteor apps.
 
Try it and see if it works for you:
 
    meteor add pbastowski:require


# More info about Babel please...

See the [Babel](http://babeljs.io/) website

# Troubleshooting

### Meteor refuses to install the latest version of this package
If Meteor refuses to update your package to the latest Meteor 1.2 version, you may have to convince it to do so like shown below. Change the version number to whatever version that you actually want.

```bash
meteor add pbastowski:angular-babel@1.0.4
```

# Changelog

### 2016-04-15 v1.3.4 for Meteor 1.3

- Fixed the problem with source maps not working.

### 2016-04-08 v1.3.3 for Meteor 1.3

- Removed unused `browser-polyfill-old.js` file from the package.

### 2016-03-29 v1.3.2 for Meteor 1.3

- Allowing this package's version of regenerator-runtime to overwrite the one that comes with Meteor 1.3. This was already there, but got regressed somehow in one of my previous updates. This is needed to support async/await functions.
- Updated to babel-core@5.8.38

### 2016-03-20 v1.3.1 for Meteor 1.3-rc.3 or higher

- Changed api.use('modules') to api.imply('modules')

### 2016-03-20 v1.3.0 for Meteor 1.3-rc.3 or higher

Release 1.3.0 adds compatibility with Meteor 1.3-rc.3 ro higher. Since Meteor 1.3 is still in Beta, there may be issues with using this package and your existing code. Please test thoroughly if you plan to use it in production systems.

Why not update to Babel 6? Because I was expecting that Meteor's own `ecmascript` package would by now provide support for Babel 6 and for Decorators. Sadly, as of this writing it does not support Decorators, and Babel 5 still works just fine for me. If necessary, I will update this package to Babel 6.

- Added dependency on the new `modules` package (thanks @urigo)
- Updated to babel-core@5.8.35
- Updated to ng-annotate@1.2.1
