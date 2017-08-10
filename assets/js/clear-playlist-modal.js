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
    clearPlaylist() {
      fetch('/playlist', { method: 'DELETE' });
    },
    onSubmit() {
      this.clearPlaylist();
      this.close();
    }
  },

  template: `
  <div class="modal clear-playlist-modal" :class="{'is-active': opened}">
    <div class="modal-background" @click="close"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Confirmation</p>
        <button class="delete"></button>
      </header>
      <section class="modal-card-body">
        <p><strong>Do you really want to clear the playlist?</strong></p>
        <p>If you click the clear button, all of tracks in the playlist will be removed.</p>
      </section>
      <footer class="modal-card-foot">
        <a class="button is-danger" @click="onSubmit">Clear</a>
        <a class="button" @click="close">Cancel</a>
      </footer>
    </div>
  </div>
  `
});
