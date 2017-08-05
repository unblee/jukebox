const ytdl = require('ytdl-core');
const FFmpeg = require('fluent-ffmpeg');
const Stream = require('stream');
const request = require('request-promise');
const memorize = require('promise-memorize');

const CACHE_TIME = Number(process.env.JUKEBOX_CACHE_TIME || 60 * 1000);

const memorized_request = memorize(request, CACHE_TIME);
const memorized_ytdl_get_info = memorize(ytdl.getInfo.bind(ytdl), CACHE_TIME);

module.exports = {
  name: 'youtube',
  pattern: /https?:\/\/(www\.)?youtu(be\.com\/watch\?v=|\.be\/)(.+)/,
  size_list: [
    'maxresdefault',
    'sddefault',
    'hqdefault',
    'mqdefault',
    'default'
  ],

  get_id(link) {
    return this.pattern.exec(link)[3];
  },

  async get_thumbnail_link(link) {
    // Don't use `for of` because of serial processing
    const uris = await Promise.all(
      this.size_list.map(async size => {
        const uri = `http://i.ytimg.com/vi/${this.get_id(link)}/${size}.jpg`;
        try {
          await memorized_request({ method: 'HEAD', uri });
          return uri;
        } catch (e) {
          return null;
        }
      }),
    );

    return uris.find(Boolean) || null;
  },

  async _get_info(link) {
    try {
      return await memorized_ytdl_get_info(link);
    } catch (e) {
      return null;
    }
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
      filter: 'audioonly',
      quality: 'lowest'
    };

    const audio = ytdl(link, opts);
    const ffmpeg = new FFmpeg(audio);

    const stream = new Stream.PassThrough();
    ffmpeg.format('mp3').pipe(stream);
    return stream;
  }
};
