new Vue({
  el: '#app',
  data: {
    playerStatus: {},
    bindPlayer: {},
    bindPlaylist: {}
  },
  async created() {
    await this.init();
    this.setupSocket();
  },
  watch: {
    /* eslint-disable no-useless-computed-key, object-shorthand */
    ['playerStatus.nowPlaying'](nowPlaying) {
      const appName = 'jukebox';
      document.title = nowPlaying
        ? `${this.playerStatus.nowPlayingContent.title} - ${appName}`
        : appName;
    }
    /* eslint-enable no-useless-computed-key, object-shorthand */
  },
  methods: {
    async init() {
      const res = await fetch('/player/status');
      this.playerStatus = await res.json();
      this.bindUpdate();
    },
    bindUpdate() {
      const { loopMode, shuffleMode, playlist, nowPlayingIdx } = this.playerStatus;
      const nowPlayingContent = nowPlayingIdx < playlist.length ? playlist[nowPlayingIdx] : null;

      this.bindPlaylist = {
        contents: playlist,
        nowPlayingIdx,
        nowPlayingContent
      };
      this.bindPlayer = {
        loopMode,
        shuffleMode,
        nowPlayingIdx,
        nowPlayingContent,
        playlist
      };
    },
    teardown() {
      this.playerStatus = {};
      this.bindPlayer = {};
      this.bindPlaylist = {};
    },
    setupSocket() {
      const socket = new WebSocket(`ws://${location.host}/socket`);

      socket.addEventListener('message', event => {
        this.playerStatus = JSON.parse(event.data);
        this.bindUpdate();
      });
      socket.addEventListener('close', () => {
        this.teardown();
        setTimeout(() => {
          this.init();
          this.setupSocket();
        }, 1000);
      });
    }
  }
});
