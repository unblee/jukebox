const ytdl = require("ytdl-core");
const FFmpeg = require("fluent-ffmpeg");
const Stream = require("stream");
const request = require("request-promise");

module.exports = {
  name: "youtube",
  pattern: /https?:\/\/(www\.)?youtu(be\.com\/watch\?v=|\.be\/)(.+)/,

  get_id(link) {
    return this.pattern.exec(link)[3];
  },

  async get_thumbnail_link(link) {
    let thumbnail_link = null;
    const size_list = [
      "maxresdefault",
      "sddefault",
      "hqdefault",
      "mqdefault",
      "default"
    ];

    for (let size of size_list) {
      const url = `http://i.ytimg.com/vi/${this.get_id(link)}/${size}.jpg`;
      try {
        await request(url);
      } catch (e) {
        continue;
      }
      thumbnail_link = url;
      break;
    }

    return thumbnail_link;
  },

  async _get_info(link) {
    let info;
    try {
      info = await ytdl.getInfo(link);
    } catch (e) {
      return null;
    }
    return info;
  },

  async get_length_seconds(link) {
    const info = await this._get_info(link);
    if (!info) return null;
    return info.length_seconds;
  },

  async get_title(link) {
    const info = await this._get_info(link);
    if (!info) return null;
    return info.title;
  },

  create_stream(link) {
    const opts = {
      filter: "audioonly",
      quality: "lowest"
    };

    const audio = ytdl(link, opts);
    const ffmpeg = new FFmpeg(audio);

    const stream = new Stream.PassThrough();
    ffmpeg.format("mp3").pipe(stream);
    return stream;
  }
};
