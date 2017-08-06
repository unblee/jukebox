new Vue({
  el: '#app',
  data: {
    playerStatus: null,
    bindPlayer: null,
    bindPlaylist: null
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
      this.bindPlayer = {
        oneLoop: this.playerStatus.oneLoop,
        playlistLoop: this.playerStatus.playlistLoop,
        shuffleMode: this.playerStatus.shuffleMode,
        nowPlaying: this.playerStatus.nowPlaying,
        nowPlayingIdx: this.playerStatus.nowPlayingIdx,
        nowPlayingContent: this.playerStatus.nowPlayingContent,
        volume: this.playerStatus.volume,
        playlist: this.playerStatus.playlist
      };
      this.bindPlaylist = {
        contents: this.playerStatus.playlist,
        nowPlayingContent: this.playerStatus.nowPlayingContent,
        nowPlayingIdx: this.playerStatus.nowPlayingIdx
      };
    },
    teardown() {
      this.playerStatus = null;
      this.bindPlayer = null;
      this.bindPlaylist = null;
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
