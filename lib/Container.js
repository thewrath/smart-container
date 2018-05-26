/**
 * @author       Axel SHAÏTA <shaita.axel@gmail.com>
 */
const path = require('path');
const fs = require('fs');
const clone = require('clone');
const ServiceDefinition = require('./ServiceDefinition');

/**
 * @class Container
 */
class Container {
  /**
   * @constructor
   */
  constructor() {
    this.services = {};
    this.properties = {};
    this.serviceDefinitions = {};
  }

  /**
   * @function load
   * @description Load a configuration file
   * @param {string} rootDir - The absolute path of the root directory
   * @param {string} configPath - The relative path of the configuration file
   * @throws {Error}
   */
  load(rootDir, configPath) {
    const configFile = path.resolve(rootDir, configPath);
    this.configDir = path.dirname(configFile);
    this.configuration = require(configFile);

    if (this.configuration.properties) {
      this.properties = this.configuration.properties;
    }
    if (this.configuration.services) {
      for (const key of Object.keys(this.configuration.services)) {
        const service = this.configuration.services[key];
        const isSingleton = service.isSingleton !== undefined ? service.isSingleton : true;
        const isPublic = service.isPublic !== undefined ? service.isPublic : true;
        if (!service.path) {
          throw new Error(`The path for the service "${key}" is required`);
        }
        let filePath = `${this.configDir}/${service.path}`;
        if (path.isAbsolute(service.path)) {
          filePath = service.path;
        }
        if (path.extname(filePath) === '') {
          filePath += '.js';
        }
        if (!fs.existsSync(filePath)) {
          throw new Error(`The path for the service "${key}" is not exists`);
        }
        this.register(key, require(filePath), isSingleton, isPublic)
          .addArguments(service.constructorArgs || [])
          .addMethodCalls(service.calls || []);
      }
    }
  }

  /**
   * @function createService
   * @description Create a service
   * @param {string} name - the name of the service
   * @param {Boolean} [getPrivate = false] - if true you can get the private service
   * @returns {Object} the service
   * @throws {Error}
   */
  createService(name, getPrivate = false) {
    if (!this.serviceDefinitions[name]) {
      throw new Error(`No service available for name "${name}"`);
    }

    if (!getPrivate) {
      if (!this.serviceDefinitions[name].isPublic) {
        throw new Error(`No service available for name "${name}"`);
      }
    }

    if (this.services[name]) {
      /* Check if the service is already exists (Implicitly, it's a singleton) */
      return this.services[name];
    }

    let service = null;
    const definition = this.serviceDefinitions[name];
    let args = this.constructArguments(definition.constructorArgs);

    if (typeof definition.class === 'function') {
      service = new (Function.prototype.bind.apply(definition.class, [null].concat(args)))();
    } else {
      service = this.serviceDefinitions[name].isSingleton ? definition.class : clone(definition.class);
    }
    for (const call of definition.methodCalls) {
      if (!service[call.method]) {
        throw new Error(`Service "${name}" doesn't have a function called "${call.method}"`);
      }
      args = this.constructArguments(call.args);
      service[call.method](...args);
    }

    if (this.serviceDefinitions[name].isSingleton) {
      this.services[name] = service;
    }
    return service;
  }

  /**
   * @function constructArguments
   * @description Construct the arguments (check if the arguments is a service, a property or a literal)
   * @param {Array} argumentsList - the array of the arguments
   * @returns {Array} the arguments
   * @throws {Error}
   */
  constructArguments(argumentsList) {
    const args = [];
    for (const arg of argumentsList) {
      if (typeof arg === 'string' && arg.startsWith('@')) {
        /* -> Check if the argument is a service reference */
        const serviceName = arg.substr(1);
        args.push(this.get(serviceName, true));
      } else if (typeof arg === 'string' && /^%[^%]+%$/.test(arg)) {
        /* -> Check if the argument is a property */
        const argumentsPath = arg.replace(/%/g, '');
        if (!this.properties[argumentsPath.split('.')[0]]) {
          throw new Error(`Property "${argumentsPath}" not found`);
        }
        args.push(this.getProperty(argumentsPath));
      } else {
        /* -> The argument is a literal */
        args.push(arg);
      }
    }
    return args;
  }

  /**
   * @function get
   * @description Get a service by name
   * @param {string} name - the name of the service
   * @returns {Object} the service
   * @throws {Error}
   */
  get(name) {
    return this.createService(name);
  }

  /**
   * @function register
   * @description Register a service
   * @param {string} name - the name of the service
   * @param {Function|Object} serviceClass - the class or the literal object of the service
   * @param {Boolean} [isSingleton = true] - true if the service is a singleton, false otherwise
   * @param {Boolean} [isPublic = true] - true if the service is public, false otherwise
   * @returns {ServiceDefinition} the service definition
   * @throws {Error}
   */
  register(name, serviceClass, isSingleton = true, isPublic = true) {
    if (this.hasService(name)) {
      throw new Error(`The service "${name}" is already exists`);
    }
    this.serviceDefinitions[name] = new ServiceDefinition(name, serviceClass, isSingleton, isPublic);
    return this.serviceDefinitions[name];
  }

  /**
   * @function hasService
   * @description Check if the service exists
   * @param {string} name - the name of the service
   * @returns {Boolean} true if the service exists, false otherwise
   */
  hasService(name) {
    return this.serviceDefinitions[name] !== undefined;
  }

  /**
   * @function getProperty
   * @description Get a property by name
   * @param {string} name - the name of the property
   * @returns {Array|number|string|Boolean|Object} the property
   * @throws {Error}
   */
  getProperty(name) {
    const property = name.split('.').reduce((prev, curr) => prev[curr], this.properties);
    if (property === undefined) {
      throw new Error(`The property "${name}" was not found`);
    }
    return clone(property);
  }

  /**
   * @function addProperty
   * @description add a property
   * @param {string} name - the name of the property
   * @param {Array|number|string|Boolean|Object} value - the value of property
   * @throws {Error}
   */
  addProperty(name, value) {
    if (this.hasProperty(name)) {
      throw new Error(`The property "${name}" is already exists`);
    }
    this.properties[name] = value;
  }

  /**
   * @function hasProperty
   * @description Check if a property exists
   * @param {string} name - the name of the property
   * @returns {Boolean} true if the property exists, false otherwise
   */
  hasProperty(name) {
    return this.properties[name] !== undefined;
  }
}

/**
 * @module
 */
module.exports = Container;
