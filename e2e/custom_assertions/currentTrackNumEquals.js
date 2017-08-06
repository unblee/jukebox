exports.assertion = function currentTrackNumEquals(num, msg) {
  this.message = msg || `Testing if current track number is ${num}`;
  this.expected = true;

  this.pass = value => value;

  this.value = result => result.value === 'equalizer';

  this.command = function command(callback) {
    this.api.getText(`.playlist-content:nth-child(${num}) .thumbnail-wrapper`, callback);
  };

  return this;
};
