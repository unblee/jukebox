const debug = require('debug')('jukebox:track');
const Provider = require('../provider/index');

module.exports = class Track {
  constructor({ provider, link, lengthSeconds, title, id, thumbnailLink }) {
    debug('create track, %o', { provider, link, lengthSeconds, title, id, thumbnailLink });
    this.provider = provider;
    this.link = link;
    this.lengthSeconds = lengthSeconds;
    this.title = title;
    this.id = id;
    this.thumbnailLink = thumbnailLink;
  }

  static async createByLink(link) {
    debug('create track by link, %s', link);
    const provider = Provider.findByLink(link);
    if (!provider) {
      throw new Error(`This link belongs to an unsupported provider ${link}`);
    }

    const providerName = provider.name;
    const lengthSeconds = await provider.getLengthSeconds(link);

    if (!lengthSeconds) {
      throw new Error(`This '${providerName}' link can not be played at the moment`);
    }

    return new this({
      provider: providerName,
      link,
      lengthSeconds,
      title: await provider.getTitle(link),
      id: provider.getId(link),
      thumbnailLink: await provider.getThumbnailLink(link)
    });
  }

  static async createByLinks(links = []) {
    // Don't use `for of` because of serial processing
    const xs = await Promise.all(
      links.map(async link => {
        try {
          return await Track.createByLink(link);
        } catch (e) {
          debug('warn: %s', e && e.message);
          return {
            link,
            errMsg: e && e.message
          };
        }
      })
    );

    return {
      tracks: xs.filter(x => x instanceof Track),
      errors: xs.filter(x => !(x instanceof Track))
    };
  }

  serialize() {
    return {
      provider: this.provider,
      link: this.link,
      lengthSeconds: this.lengthSeconds,
      title: this.title,
      id: this.id,
      thumbnailLink: this.thumbnailLink
    };
  }
};
