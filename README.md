# Babel and ng-annotate in one package

> **Important information** if you have recently updated to v1.0.3 or higher, which introduced configuration through `.babelrc`. Please rename `.babelrc` to `babel.json`, because under certain circumstances Babel reports errors when it encounters a custom keys in `babel.rc`, such as "verbose". Thus, I have reverted to using `babel.json` from v1.0.5 onwards. Apologies for any inconvenience.
 
This package is meant to be used with [Angular-Meteor](http://angular-meteor.com) and the corresponding `angular` package. 

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
    "verbose": false,      // true shows files as they are compiled
    "debug": false,        // true displays the config file settings
    "modules": "common",   // What module format Babel should use. See
                           // Babel documentation for "modules" option.
    "blacklist": ['useStrict'],  // Do not change this unless you know
                                 // very well what you are doing.
    "stage": 0,            // If you really need to change this then
                           // see Babel documentation stage options.
    "extensions": ["js"]   // "js" means compile all ".js" files.

    "server": {
        "modules": "common" // JS files on the server side can use a
                            // different module system to the client side
    },

    "files": {
        "mobile-config.js": {
            "modules": "common"
        },
        "server/main.js": {
            "modules": "common"
        }
    }
}
```

### Using different module types for some files

The `modules` property allows you to specify what module type to use. The default for Meteor apps is `common`, which represents the CommonJS module format. You can also use SystemJS, see SystemJS heading, below.

## Using `import ... from` 

Babel does not include a module loader, so statements such as below, will not work out of the box
 
```javascript
import {x, y, z} from "modulename";
```

However, if your `modules` setting is `{ "modules": "system" }` then we can use `pbastowski:systemjs` to load modules compiled with Babel. For CommonJS modules, which is the default "modules" setting, we can use `pbastowski:require`.

### SystemJS

SystemJS can be used on both the client and the server side. You have to configure Babel through `babel.json` to output SystemJS modules, as shown below.

**Client side config**

Add the following to your `babel.json` file.

    "modules": "system"

**Server side config**

    "server": {
        "modules": "system"
        "startupfile": "server/main.js"
    }

> There is no default for **startupfile**, because I have no way of knowing if you are already using my default for some other purpose in your project. So, make sure to specify your correct **startupfile** in babel.json.

#### Usage in your code

Next, you need to know how to use these modules in your code.

SystemJS modules are assigned (registered) a name based on their file name within your project. Below are some examples that show how a file name is converted to a module name, which you can import:
 
file name | module name
----------|------------
client/app/app.js | client/app/app
client/feature1/feature1.js | client/feature1/feature1
client/feature1/lib/xxx.js | client/feature1/lib/xxx
client/lib/angular-messages.min.js | client/lib/angular-messages.min

#### Add SystemJS to your Meteor project

    meteor add pbastowski:systemjs
 
#### Use `System.import` to kick off your app

##### Client side

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

##### Server Side

On the server side at least one JS file must use a self-executing (non SystemJS) module format. This is because SystemJS only registers modules, but does not actually execute the code in them. If all server side JS files were to use the SystemJS module format then no JS files on the server-side would be executed, which is why we specify our `startupfile` in **babel.json**. This file will be executed and will kick off our app on the server side, just like **index.html** did on the client side.

The `startupfile` file looks something like below. It may also have other code, but it must have at least one `System.import` statement.

```javascript
System.import('server/index');
```

Tha above line will import and execute the code in 'server/index.js'. You can of course import any file you wish.

### CommonJS

When the module format is `common`, which is the default for this Babel plugin, you don't actually have to do anything special as long as you don't `import` or `export` in your ES6 files. Babel will compile your code and output files that will be loaded and executed just like any normal non-compiled JS files would be.  

#### But I really want to import and export

If you use `import ... from` or `export` syntax in your ES6 code you may see errors in your dev console complaining about a missing `require`. To get around that, I have created the package `pbastowski:require`, which implements just enough of `require` and `module.exports` to enable you to export and import in Meteor apps.
 
Try it and see if it works for you:
 
    meteor add pbastowski:require


## More info about Babel please...

See the [Babel](http://babeljs.io/) website

## Troubleshooting

### Meteor refuses to install the latest version of this package

If Meteor refuses to update your package to the latest Meteor 1.2 version, you may have to convince it to do so like shown below. Change the version number to whatever version that you actually want.

```bash
meteor add pbastowski:angular-babel@1.0.4
```

### For Meteor 1.1, what is the latest version of this package?

The latest version of `pbastowski:angular-babel` for Meteor 1.1 is `0.1.10`
