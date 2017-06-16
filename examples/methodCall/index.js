const ContainerBuilder = require('../../lib/ContainerBuilder');

const container = ContainerBuilder.build(__dirname, './config/services.js');

container.get('messagePrinter').print();
