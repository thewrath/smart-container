module.exports = {
  properties: {
    message: 'This message was transformed in uppercase'
  },
  services: {
    messagePrinter: {
      path: '../MessagePrinter.js',
      constructorArgs: ['%message%', '@transformer']
    },
    transformer: {
      path: '../Transformer.js',
    }
  }
};
