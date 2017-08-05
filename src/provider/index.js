const providers = [];
const youtube = require('./youtube.js');

providers.push(youtube);

module.exports = {
  find_by_link(link) {
    return providers.find(provider => provider.pattern.test(link));
  },

  find_by_name(name) {
    return providers.find(provider => provider.name === name);
  },

  get providers() {
    return providers;
  }
};
