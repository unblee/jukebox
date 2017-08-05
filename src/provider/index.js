const providers = [];
const youtube = require('./youtube.js');

providers.push(youtube);

module.exports = {
  findByLink(link) {
    return providers.find(provider => provider.pattern.test(link));
  },

  findByName(name) {
    return providers.find(provider => provider.name === name);
  },

  get providers() {
    return providers;
  }
};
