class MessagePrinter {
  constructor(msg = '', transformer) {
    this.msg = msg;
    this.transformer = transformer;
  }

  print() {
    console.log(this.transformer.transform(this.msg));
  }
}

module.exports = MessagePrinter;

