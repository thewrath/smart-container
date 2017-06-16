class ClassService {
  constructor(msg = '') {
    this.msg = msg;
    this.transformer = null;
  }

  setTransformer(transformer) {
    this.transformer = transformer;
  }

  setMessage(msg = '') {
    this.msg = msg;
  }

  print() {
    if (this.transformer) {
      console.log(this.msg);
    } else {
      console.log(this.transformer.transform(this.msg));
    }
  }
}

module.exports = ClassService;

