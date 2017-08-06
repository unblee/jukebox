new Vue({
  el: '#app',
  data: {
    playerStatus: {}
  },
  computed: {
    nowPlayingContent() {
      const { nowPlayingIdx: idx, playlist } = this.playerStatus;
      return (playlist && idx < playlist.length && playlist[idx]) || null;
    },
    bindPlayer() {
      return {
        playlist: this.playerStatus.playlist,
        state: this.playerStatus.state,
        loopMode: this.playerStatus.loopMode,
        shuffleMode: this.playerStatus.shuffleMode,
        nowPlayingIdx: this.playerStatus.nowPlayingIdx,
        nowPlayingContent: this.nowPlayingContent
      };
    },
    bindPlaylist() {
      return {
        contents: this.playerStatus.playlist,
        nowPlayingIdx: this.playerStatus.nowPlayingIdx,
        nowPlayingContent: this.nowPlayingContent
      };
    }
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
    },
    teardown() {
      this.playerStatus = {};
    },
    setupSocket() {
      const socket = new WebSocket(`ws://${location.host}/socket`);

      socket.addEventListener('message', event => {
        this.playerStatus = JSON.parse(event.data);
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
