# Babel and ng-annotate in one package

This package is meant to be used with [Angular-Meteor](http://angular-meteor.com) and the corresponding `angular` package. If you are not wotking with angular-meteor then consider using Meteor's own `ecmascript` package.

## Install

```shell
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


## `import ... from` and `require`

Babel does not include a `require` loader, it just compiles statements such as shown below

```javascript
import {x, y, z} from "modulename";
```

into something like this 

```javascript
var x = require('modulename')['x'];
var y = require('modulename')['y'];
var z = require('modulename')['z'];
```

So, if you actually use the `import ... from` syntax in your code then you may see errors in your dev console. To get around that, I have created a simple `require` package, which implements just enough of `require` and `module.exports` to enable you to export and import in Meteor apps. 
 
Try it and see if it works for you:
 
    meteor add pbastowski:require
     
## More info please...

See the [Babel website](http://babeljs.io/)

