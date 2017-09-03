new Vue({
  el: '#app',
  data: {
    activeTab: 'playlist',
    appName: 'jukebox'
  },
  store,
  computed: {
    title() {
      if (this.status.state === 'playing' && this.nowPlayingTitle) {
        return `${this.nowPlayingTitle} - ${this.appName}`;
      }
      return this.appName;
    },
    ...mapState(['status']),
    ...mapGetters(['nowPlayingTitle', 'trackCount'])
  },
  async created() {
    await this.init();
    this.setupSocket();
  },
  watch: {
    title() {
      document.title = this.title;
    }
  },
  methods: {
    setupSocket() {
      const socket = new WebSocket(`ws://${location.host}/socket`);

      socket.addEventListener('message', event => {
        const { name, data } = JSON.parse(event.data);
        if (name === 'update-history') {
          this.setHistory(data);
        } else if (name === 'update-status') {
          this.setStatus(data);
          if (data.playlist) {
            this.setPlaylist(data.playlist);
          }
        } else if (name === 'updated-seek') {
          this.setSeekSeconds(data.seekSeconds);
        }
      });
      socket.addEventListener('close', () => {
        this.teardown();
        setTimeout(async () => {
          try {
            await this.init();
          } catch (e) {
            console.error(e);
          }
          this.setupSocket();
        }, 1000);
      });
    },
    switchTab(componentName) {
      this.activeTab = componentName;
    },
    ...mapMutations(['setHistory', 'setStatus', 'setPlaylist', 'setSeekSeconds', 'teardown']),
    ...mapActions(['init'])
  }
});
