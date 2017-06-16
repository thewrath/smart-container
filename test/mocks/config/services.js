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
    literalInjection: {
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
          args: ['@Object']
        }
      ]
    },
    paramError: {
      path: '../ClassService.js',
      constructorArgs: ['%unknown%'],
    },
    callError: {
      path: '../ClassService.js',
      calls: [
        {
          name: 'call'
        }
      ]
    }
  }
};
