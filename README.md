# smart-container

  smart-container is a dependency injection container for NodeJS which can be configured with a configuration file.

   [![npm version](https://badge.fury.io/js/smart-container.svg)](https://badge.fury.io/js/smart-container)
   [![codebeat badge](https://codebeat.co/badges/a63e9383-f9a6-4e41-9e97-7557a9114fc6)](https://codebeat.co/projects/github-com-arkerone-smart-container-master)
   [![Build Status](https://travis-ci.org/arkerone/smart-container.svg?branch=master)](https://travis-ci.org/arkerone/smart-container)
   [![codecov](https://codecov.io/gh/arkerone/smart-container/branch/master/graph/badge.svg)](https://codecov.io/gh/arkerone/smart-container)



## Installation
```
$ npm install --save smart-container
```

## Features

  * Define classes or literal objects to container,
  * Define properties to container,
  * Inject dependencies in constructor,
  * Inject dependencies in methods,
  * Setting up the container with a configuration file,
  * Lazy loading (The services are created when you need them).

## Usage

### Create and use the container without configuration file

#### Get the container builder
```js
const containerBuilder = require('smart-container');
```

#### Create the container
```js
const container = containerBuilder.create();
```

#### Create and register a new service
```js
/* Create a service class */
class Hello {
  constructor() {
    this.msg = 'Hello world!';
  }

  sayHello() {
    console.log(this.msg);
  }
}

/* Register the service */
container.register('hello', Hello);
```

#### Get and use the service
```js
container.get('hello').sayHello(); // Print 'Hello world!'
```

### The configuration file
Here is a template of a service configuration file (the file can be a JSON or a JS file) :

```js
module.exports = {
  properties: {
    propertyName: 'property_value'
  },
  services: {
    serviceName: {
      path: 'relative_path_to_the_service',
      constructorArgs: ['first_arg', 'second_arg' /*... others args*/],
      isSingleton: false, /* By default a service is a singleton */
      calls: [
        {
          method: 'method_name',
          args: ['first_arg', 'second_arg' /*... others args*/]
        }
      ]
    }
  }
};
```
#### The properties
The object `properties` is used to define a collection of properties. For each property, you must specify its name and its value :
```js
{
  properties: {
    firstName: 'John',
    lastName: 'Doe'
  }
}
```
You can create an object as property :
```js
{
  properties: {
    person: {
      firstName: 'John',
      lastName: 'Doe'
    }
  }
}
```

#### The services
##### The name and path of the service
The object `services` is used to define a collection of services. For each service, you must specify its name and the path of its file :
```js
{
  services: {
    messagePrinter: {
      path: './MessagePrinter'
    }
  }
}
```
##### constructorArgs
you can specify the arguments of the service `constructor` :
```js
{
  services: {
    messagePrinter: {
      path: './MessagePrinter',
      constructorArgs: ['Hello world!']
    }
  }
}
```
It's possible to reference of a property (defined in the configuration file), just wrap the name of the property with `%` :
```js
{
  services: {
    messagePrinter: {
      path: './MessagePrinter',
      constructorArgs: ['%message%']
    }
  }
}
```
If the property is an object, you can access of the object property like that :
```js
'%person.firstName%'
```
It's also possible to reference of a other service. Just prefix the service name with `@`:
```js
'@otherService'
```
##### isSingleton
You can specify if the service is a singleton or not (by default a service is a singleton) :
```js
{
  services: {
    messagePrinter: {
      path: './MessagePrinter',
      constructorArgs: ['%message%'],
      isSingleton: false
    }
  }
}
```
In the case of a literal object, if `isSingleton` is set to false, the object Is copied. 
##### calls
At the creation of the service, it's possible to call several methods :
```js
{
  services: {
    messagePrinter: {
      path: './MessagePrinter',
      constructorArgs: ['%message%'],
      calls: [{
        method: 'setMessage',
        args: ['Hello guys!']
      }]
    }
  }
}
```
You can, like the arguments of the `constuctor`, make a reference to a property or a service.

#### Build a container with the configuration file

#### Create a service class
MessagePrinter.js
```js
module.exports = class MessagePrinter {
  constructor(msg) {
    this.msg = msg;
  }

  setMessage(msg) {
    this.msg = msg;
  }

  print() {
    console.log(this.msg);
  }
};
```
#### Create the configuration file
Services.js
```js
module.exports = {
  properties: {
    message: 'Hello world',
  },
  services: {
    messagePrinter: {
      path: './MessagePrinter',
      constructorArgs: ['%message%'],
      calls: [{
        method: 'setMessage',
        args: ['Hello guys!']
      }]
    }
  }
};
```
#### Get the container builder
```js
const containerBuilder = require('smart-container');
```
#### Build the container
```js
const container = containerBuilder.build(__dirname, './Services.js');
```
#### Get and use the service
```js
container.get('messagePrinter').print(); // Print 'Hello guys!'
```
## API

### ContainerBuilder

#### create()
Create an empty container
#### build(rootDir, configPath)
Create a container with a configuration file. The parameters are :
* `rootDir`: The absolute path for the root directory (use `__dirname`),
* `configPath`: The relative path of the configuration file.

### Container

#### load(rootDir, configPath)
Load a configuration file. The parameters are :
* `rootDir`: The absolute path for the root directory (use `__dirname`),
* `configPath`: The relative path of the configuration file.
#### get(name)
Get a service by its `name`
#### register(name, serviceClass)
Register a service. The parameters are :
 * `name`: The name of the service,
 * `serviceClass`: the class or the literal object of the service,
 * `isSingleton`: (optional : by default true) true if the service is a singleton, false otherwise.
 
 This function return an `ServiceDefinition` object (see below).
#### hasService(name)
Check if the service exists with its `name`
#### getProperty(name)
Get a property by its `name`. You can access of an object property like that :
```js
'person.firstName'
```
#### addProperty(name, value)
Add a property. The parameters are :
 * `name`: The name of the property,
 * `value`: the value of property.
#### hasProperty(name)
Check if the property exists with its `name`.

### ServiceDefinition
This object is used to describe a service.

#### addArgument(value)
Add a argument `value` used by the constructor. You can use the symbol `@` to make reference to an other service or wrap the `value` with `%` to make reference to a property.
#### addArguments(args)
Add several arguments used by the constructor. The parameter `args` is an array.
#### addMethodCall(method, args = [])
Add a method call. The parameters are :
 * `method`:  the name of the method,
 * `args`: (optional) the array of method arguments.
#### addMethodCalls(calls)
Add a several method calls. The parameter is :
 * `calls`:  the array of method calls.
 
Each element of the `calls` array is an object with the following properties:
* `method`: the name of the method,
* `args`: the array of method arguments.

## Examples

Check out the `examples` directory to see more complex examples.

## License
The MIT License (MIT)

Copyright (c) 2017 Axel SHAÏTA <shaita.axel@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
