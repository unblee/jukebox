new Vue({
  el: '#app',
  data: {
    playerStatus: {},
    history: [],
    activeTab: 'playlist'
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
        nowPlayingContent: this.nowPlayingContent,
        volume: this.playerStatus.volume
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
      const status = await fetch('/player/status');
      this.playerStatus = await status.json();

      const history = await fetch('/history');
      this.history = await history.json();
    },
    teardown() {
      this.playerStatus = {};
    },
    setupSocket() {
      const socket = new WebSocket(`ws://${location.host}/socket`);

      socket.addEventListener('message', event => {
        const { name, data } = JSON.parse(event.data);
        if (name === 'update-history') {
          this.history = data;
        } else if (name === 'update-status') {
          this.playerStatus = data;
        }
      });
      socket.addEventListener('close', () => {
        this.teardown();
        setTimeout(() => {
          this.init();
          this.setupSocket();
        }, 1000);
      });
    },
    activePlayerTab() {
      this.activeTab = 'playlist';
    },
    activeHistoryTab() {
      this.activeTab = 'history';
    }
  }
});
