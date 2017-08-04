new Vue({
  el: "#app",
  data: {
    player_status: {},
    bind_player: {},
    bind_playlist: {}
  },
  async created() {
    await this.init();
    this.setup_socket();
  },
  watch: {
    ["player_status.now_playing"](now_playing) {
      const app_name = "jukebox";
      document.title = now_playing
        ? `${this.player_status.now_playing_content.title} - ${app_name}`
        : app_name;
    }
  },
  methods: {
    async init() {
      const res = await fetch("/player/status");
      this.player_status = await res.json();
      this.bind_update();
    },
    bind_update() {
      this.bind_player = {
        one_loop: this.player_status.one_loop,
        playlist_loop: this.player_status.playlist_loop,
        shuffle_mode: this.player_status.shuffle_mode,
        now_playing: this.player_status.now_playing,
        now_playing_idx: this.player_status.now_playing_idx,
        now_playing_content: this.player_status.now_playing_content,
        playlist: this.player_status.playlist
      };
      this.bind_playlist = {
        contents: this.player_status.playlist,
        now_playing_content: this.player_status.now_playing_content,
        now_playing_idx: this.player_status.now_playing_idx
      };
    },
    teardown() {
      this.player_status = {};
      this.bind_player = {};
      this.bind_playlist = {};
    },
    setup_socket() {
      const socket = new WebSocket(`ws://${location.host}/socket`);

      socket.addEventListener("message", event => {
        this.player_status = JSON.parse(event.data);
        this.bind_update();
      });
      socket.addEventListener("close", () => {
        this.teardown();
        setTimeout(() => {
          this.init();
          this.setup_socket();
        }, 1000);
      });
    }
  }
});
