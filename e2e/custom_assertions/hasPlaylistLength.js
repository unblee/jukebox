exports.assertion = function hasPlaylistLength(num, msg) {
  this.message = msg || `Testing if length of playlist is ${num}`;
  this.expected = num;

  this.pass = value => value === this.expected;

  this.value = result => result.value.length;

  this.command = function command(callback) {
    this.api.elements(this.client.locateStrategy, '.playlist-content', callback);
  };

  return this;
};
