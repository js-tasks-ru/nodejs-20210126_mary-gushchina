const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor({limit, ...rest}) {
    super(rest);
    this.limit = limit;
    this.totalSize = 0;
  }

  _transform(chunk, encoding, callback) {
    this.totalSize += chunk.length;

    if (this.totalSize > this.limit) {
      return callback(new LimitExceededError(), null);
    }

    callback(null, chunk);
  }
}

module.exports = LimitSizeStream;
