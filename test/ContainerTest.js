const chai = require('chai');
const ContainerBuilder = require('../lib/ContainerBuilder');
const ClassService = require('./mocks/ClassService');
const TransformerService = require('./mocks/TransformerService');

describe('/lib/Container.js', () => {
  before(() => {
    this.container = ContainerBuilder.build(__dirname, './mocks/config/services.js');
  });

  describe('The creation of a container', () => {
    it('The container must be created', () => {
      chai.expect(this.container).to.not.be.null;
    });
    it('The container must not contains services', () => {
      const containerWithConfigFile = ContainerBuilder.build(__dirname, './mocks/config/servicesEmpty.js');
      chai.expect(containerWithConfigFile.services).to.be.empty;
      const containerWithoutConfigFile = ContainerBuilder.create();
      chai.expect(containerWithoutConfigFile.services).to.be.empty;
    });
    it('Throw error when load a configuration file with an missing path', () => {
      chai.expect(() => ContainerBuilder.build(__dirname, './mocks/config/servicesPathEmpty.js')).to.throw();
    });
    it('Throw error when load a configuration file with a bad path', () => {
      chai.expect(() => ContainerBuilder.build(__dirname, './mocks/config/servicesAbsolutePath.js')).to.throw();
    });
  });

  describe('#get', () => {
    it('Get the services', () => {
      chai.expect(this.container.get('Object')).to.be.an.instanceof(Object);
      chai.expect(this.container.get('MethodCall')).to.be.an.instanceof(ClassService);
      chai.expect(this.container.get('LiteralInjection')).to.be.an.instanceof(ClassService);
      chai.expect(this.container.get('Class')).to.be.an.instanceof(ClassService);
    });
    it('Check the injection', () => {
      chai.expect(this.container.get('LiteralInjection').msg).to.equal('test');
      chai.expect(this.container.get('MethodCall').msg).to.equal(this.container.getProperty('message'));
      chai.expect(this.container.get('MethodCall').transformer).to.be.an.instanceof(TransformerService);
    });
    it('Throw error when get an unknown service', () => {
      chai.expect(() => this.container.get('unknownService')).to.throw();
    });
    it('Throw error when get a service with an unknown function', () => {
      chai.expect(() => this.container.get('CallError')).to.throw();
    });
    it('Throw error when get a service with an unknown property', () => {
      chai.expect(() => this.container.get('ParamError')).to.throw();
    });
  });

  describe('#register', () => {
    it('register services', () => {
      const container = ContainerBuilder.create();
      container.addProperty('value', 10);
      container.register('getValue', class {
        constructor(value) {
          this.value = value;
        }

        getValue() {
          return this.value;
        }
      }).addArgument('%value%');

      chai.expect(() => container.get('getValue')).to.not.throw();
      chai.expect(container.get('getValue').getValue()).to.equal(10);

      container.register('compute', class {
        constructor(a, b) {
          this.a = a;
          this.b = b;
          this.result = 0;
        }

        compute() {
          this.result = this.a + this.b;
        }

        getResult() {
          return this.result;
        }
      }).addArguments([5, 10]).addMethodCall('compute');
      chai.expect(() => container.get('compute')).to.not.throw();
      chai.expect(container.get('compute').getResult()).to.equal(15);
    });
    it('Check the singleton service', () => {
      this.container.register('Singleton', class {
      }, true);
      chai.expect(this.container.get('Singleton')).to.equal(this.container.get('Singleton'));
      chai.expect(this.container.get('Class')).to.equal(this.container.get('Class'));
      const obj1 = this.container.get('Object');
      const obj2 = this.container.get('Object');
      obj1.value = 1;
      chai.expect(obj1).to.deep.equal(obj2);
    });
    it('Check the non singleton service', () => {
      this.container.register('NonSingleton', class {
      }, false);
      chai.expect(this.container.get('NonSingleton')).to.not.equal(this.container.get('NonSingleton'));
      chai.expect(this.container.get('NonSingletonClass')).to.not.equal(this.container.get('NonSingletonClass'));
      const obj1 = this.container.get('NonSingletonObject');
      const obj2 = this.container.get('NonSingletonObject');
      obj1.value = 2;
      chai.expect(obj1).to.not.deep.equal(obj2);
    });
    it('Throw error when register a service which already exists', () => {
      chai.expect(() => this.container.register('Class', {})).to.throw();
    });
  });

  describe('#hasService', () => {
    it('hasService must return true', () => {
      chai.expect(this.container.hasService('Class')).to.be.true;
    });
    it('hasService must return false', () => {
      chai.expect(this.container.hasService('unknown')).to.be.false;
    });
  });

  describe('#getProperty', () => {
    it('Get a property ', () => {
      chai.expect(this.container.getProperty('person.firstName')).to.equal('John');
      chai.expect(this.container.getProperty('message')).to.equal('Hello world');
    });
    it('Throw error when get an unknown property', () => {
      chai.expect(() => this.container.getProperty('person.age')).to.throw();
      chai.expect(() => this.container.getProperty('unknownParam')).to.throw();
    });
  });

  describe('#addProperty', () => {
    it('add a property ', () => {
      this.container.addProperty('a', 0);
      chai.expect(this.container.getProperty('a')).to.equal(0);
    });

    it('Throw error when add a property which already exists', () => {
      chai.expect(() => this.container.addProperty('a', 0)).to.throw();
    });
  });

  describe('#hasProperty', () => {
    it('hasProperty must return true', () => {
      this.container.addProperty('b', 0);
      chai.expect(this.container.hasProperty('b')).to.be.true;
    });
    it('hasProperty must return false', () => {
      chai.expect(this.container.hasProperty('c')).to.be.false;
    });
  });
});
