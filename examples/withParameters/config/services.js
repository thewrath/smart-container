module.exports = {
  properties: {
    message: 'This message was injected in the constructor'
  },
  services: {
    messagePrinter: {
      path: '../MessagePrinter.js',
      constructorArgs: ['%message%']
    }
  }
};
