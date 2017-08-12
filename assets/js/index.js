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
    },
    tracks() {
      return this.activeTab === 'playlist' ? this.bindPlaylist : this.history;
    }
  },
  async created() {
    await this.init();
    this.setupSocket();
  },
  watch: {
    /* eslint-disable no-useless-computed-key, object-shorthand */
    ['playerStatus.state'](state) {
      const appName = 'jukebox';
      document.title =
        state === 'playing'
          ? `${this.playerStatus.playlist[this.playerStatus.nowPlayingIdx].title} - ${appName}`
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
      this.history = [];
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
    switchTab(componentName) {
      this.activeTab = componentName;
    },
    movedPlaylist({ newIndex, oldIndex }) {
      // this is for beautiful rendering, same as server side
      const playingIndex = this.playerStatus.nowPlayingIdx;
      if (playingIndex === oldIndex) {
        this.playerStatus.nowPlayingIdx = newIndex;
      } else if (newIndex <= playingIndex && playingIndex < oldIndex) {
        this.playerStatus.nowPlayingIdx = playingIndex + 1;
      } else if (oldIndex < playingIndex && playingIndex <= newIndex) {
        this.playerStatus.nowPlayingIdx = playingIndex - 1;
      }
    }
  }
});
