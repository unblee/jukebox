const Provider = require('./provider');

module.exports = class Track {
  constructor({ provider, link, lengthSeconds, title, id, thumbnailLink }) {
    this.provider = provider;
    this.link = link;
    this.lengthSeconds = lengthSeconds;
    this.title = title;
    this.id = id;
    this.thumbnailLink = thumbnailLink;
  }

  static async createByLink(link) {
    const provider = Provider.findByLink(link);
    if (!provider) {
      throw new Error('This link belongs to an unsupported provider');
    }

    const providerName = provider.name;
    const track = new this({
      provider: providerName,
      link,
      lengthSeconds: await provider.getLengthSeconds(link),
      title: await provider.getTitle(link),
      id: provider.getId(link),
      thumbnailLink: await provider.getThumbnailLink(link)
    });

    if (!track.lengthSeconds) {
      throw new Error(`This '${providerName}' link can not be played at the moment`);
    }

    return track;
  }

  static async createByLinks(links = []) {
    // Don't use `for of` because of serial processing
    const xs = await Promise.all(
      links.map(async link => {
        try {
          return await Track.createByLink(link);
        } catch (e) {
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
