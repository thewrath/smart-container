module.exports = {
  properties: {
    message1: 'This message was injected by the constructor',
    message2: 'This message was injected by the setMessage method'
  },
  services: {
    messagePrinter: {
      path: '../MessagePrinter.js',
      constructorArgs: ['%message1%'],
      calls: [
        {
          method: 'setMessage',
          args: ['%message2%']
        }
      ]
    }
  }
};
