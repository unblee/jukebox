Vue.component('clear-playlist-modal', {
  data() {
    return {
      opened: false
    };
  },
  methods: {
    open() {
      this.opened = true;
    },
    close() {
      this.opened = false;
    },
    onSubmit() {
      this.clearPlaylist();
      this.close();
    },
    ...mapActions(['clearPlaylist'])
  },

  template: `
  <div class="modal clear-playlist-modal" :class="{'is-active': opened}">
    <div class="modal-background" @click="close"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Confirmation</p>
        <button class="delete" @click="close"></button>
      </header>
      <section class="modal-card-body">
        <p><strong>Do you really want to clear the playlist?</strong></p>
        <p>If you click the clear button, all of tracks in the playlist will be removed.</p>
      </section>
      <footer class="modal-card-foot is-right">
      <a class="button" @click="close">Cancel</a>
      <a class="button is-danger submit-clear-button" @click="onSubmit">Clear</a>
      </footer>
    </div>
  </div>
  `
});
