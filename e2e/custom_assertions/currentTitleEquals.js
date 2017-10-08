exports.assertion = function currentTitleEquals(num, msg) {
  this.message = msg || 'Testing if the page title equals playing music';
  this.expected = '';

  this.pass = value => `${value} - jukebox` === this.expected;

  this.value = result => result.value;

  this.command = function command(callback) {
    this.api.getTitle(title => {
      this.expected = title;
      this.api.getText(`.playlist-content:nth-child(${num}) .playlist-content-title`, callback);
    });
  };
};
