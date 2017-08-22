new Vue({
  el: '#app',
  data: {
    activeTab: 'playlist'
  },
  store,
  computed: {
    title() {
      const appName = 'jukebox';
      const { status: { state } } = this.$store;
      const contentTitle = this.$store.getters.nowPlayingTitle;
      return state === 'playing' && contentTitle ? `${contentTitle} - ${appName}` : appName;
    },
    ...mapState({
      seekSeconds: 'seekSeconds'
    }),
    ...mapState(['history', 'seekSeconds']),
    ...mapGetters(['nowPlayingContent', 'trackCount'])
  },
  async created() {
    await this.$store.dispatch('init');
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
          this.$store.commit('setHistory', data);
        } else if (name === 'update-status') {
          this.$store.commit('setStatus', data);
        } else if (name === 'updated-seek') {
          this.$store.commit('setSeekSeconds', data.seekSeconds);
        }
      });
      socket.addEventListener('close', () => {
        this.$store.commit('teardown');
        this.teardown();
        setTimeout(async () => {
          await this.$store.dispatch('init');
          this.setupSocket();
        }, 1000);
      });
    },
    switchTab(componentName) {
      this.activeTab = componentName;
    }
  }
});
