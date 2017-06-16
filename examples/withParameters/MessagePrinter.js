class MessagePrinter {
  constructor(msg = '') {
    this.msg = msg;
  }

  print() {
    console.log(this.msg);
  }
}

module.exports = MessagePrinter;

