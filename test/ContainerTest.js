const chai = require('chai');
const ContainerBuilder = require('../lib/ContainerBuilder');
const ClassService = require('./mocks/ClassService');

describe('/lib/Container.js', () => {
  before(() => {
    this.container = ContainerBuilder.create();
    this.container.load(__dirname, './mocks/config/services.js');
  });

  describe('#constructor', () => {
    it('The container must be created', () => {
      chai.expect(this.container).to.not.be.null;
    });
    it('The container must not contains services', () => {
      const container = ContainerBuilder.build(__dirname, './mocks/config/servicesEmpty.js');
      chai.expect(container.services).to.be.empty;
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
      chai.expect(this.container.get('literalInjection')).to.be.an.instanceof(ClassService);
      chai.expect(this.container.get('Class')).to.be.an.instanceof(ClassService);
    });
    it('Throw error when get an unknown service', () => {
      chai.expect(() => this.container.get('unknownService')).to.throw();
    });
    it('Throw error when get a service with an unknown function', () => {
      chai.expect(() => this.container.get('callError')).to.throw();
    });
    it('Throw error when get a service with an unknown property', () => {
      chai.expect(() => this.container.get('paramError')).to.throw();
    });
  });

  describe('#register', () => {
    it('register services', () => {
      this.container.register('getValue', class {
        constructor(value) {
          this.value = value;
        }

        getValue() {
          return this.value;
        }
      }).addArgument('%value%');
      chai.expect(() => this.container.get('getValue')).to.not.throw();
      chai.expect(this.container.get('getValue').getValue()).to.equal(10);

      this.container.register('compute', class {
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
      chai.expect(() => this.container.get('compute')).to.not.throw();
      chai.expect(this.container.get('compute').getResult()).to.equal(15);
    });
    it('Throw error when register a service which already exists', () => {
      chai.expect(() => this.container.register('getValue', {})).to.throw();
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
