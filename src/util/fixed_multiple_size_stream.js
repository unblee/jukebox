const { Transform } = require('stream');

// Transform Stream fixing chunk length to be a multiple of specified number.
// e.g., if specified number is 4 and input buffer length is 6, 7, 8, 9,
// output buffer length is 4, 8, 8 and 8,
// and left buffer length is 2, 1, 1 and 2, respectively.
module.exports = class FixedMultipleSizeStream extends Transform {
  constructor(opts = {}) {
    super(opts);
    this._multipleNumber = opts.multipleNumber || 1;
    this._buf = Buffer.allocUnsafe(this._multipleNumber);
    this._bufLen = 0;
  }

  _transform(buf, encoding, callback) {
    const sumLen = this._bufLen + buf.length;
    const leftLen = sumLen % this._multipleNumber;
    const outLen = sumLen - leftLen;

    const out = Buffer.allocUnsafe(outLen);
    this._buf.copy(out, 0, 0, this._bufLen);
    buf.copy(out, this._bufLen, 0, outLen - this._bufLen);

    buf.copy(this._buf, 0, buf.length - leftLen, buf.length);
    this._bufLen = leftLen;

    this.push(out);

    callback();
  }
};
