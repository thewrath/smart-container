module.exports = {
  properties: {
    message: 'Hello world',
    person: {
      firstName: 'John',
      lastName: 'Doe'
    },
    value: 10
  },
  services: {
    Class: {
      path: '../ClassService.js',
      constructorArgs: ['%message%'],
    },
    Object: {
      path: '../ObjectService.js',
    },
    Transformer: {
      path: '../TransformerService.js',
    },
    LiteralInjection: {
      path: '../ClassService.js',
      constructorArgs: 'test',
    },
    MethodCall: {
      path: '../ClassService.js',
      calls: [
        {
          method: 'setMessage',
          args: ['%message%']
        },
        {
          method: 'setTransformer',
          args: ['@Transformer']
        }
      ]
    },
    NonSingletonClass: {
      path: '../ClassService.js',
      constructorArgs: ['%message%'],
      isSingleton: false
    },
    NonSingletonObject: {
      path: '../ObjectService.js',
      constructorArgs: ['%message%'],
      isSingleton: false
    },
    ParamError: {
      path: '../ClassService.js',
      constructorArgs: ['%unknown%'],
    },
    CallError: {
      path: '../ClassService.js',
      calls: [
        {
          name: 'call'
        }
      ]
    }
  }
};
