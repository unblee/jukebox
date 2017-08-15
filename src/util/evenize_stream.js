const { Transform } = require('stream');

// Transform Stream fixing chunk length to be even (for pcm-volume stream)
module.exports = class EvenizeStream extends Transform {
  constructor(opts) {
    super(opts);
    this._buf = null;
  }

  _transform(buf, encoding, callback) {
    const isEven = !(buf.length % 2);

    if (isEven && !this._hasBuf) {
      this.push(buf);
    } else if (isEven && this._hasBuf) {
      // replace
      const out = Buffer.allocUnsafe(buf.length);
      buf.copy(out, 1, 0, buf.length - 1);
      out[0] = this._buf;
      this._buf = buf[buf.length - 1];
      this.push(out);
    } else if (!isEven && !this._hasBuf) {
      // remove
      const out = Buffer.allocUnsafe(buf.length - 1);
      buf.copy(out, 0, 0, buf.length - 1);
      this._buf = buf[buf.length - 1];
      this.push(out);
    } else {
      // !isEven && hasBuf
      // add
      const out = Buffer.allocUnsafe(buf.length + 1);
      buf.copy(out, 1, 0, buf.length);
      out[0] = this._buf;
      this._buf = null;
      this.push(out);
    }

    callback();
  }

  get _hasBuf() {
    return this._buf !== null;
  }
};
