Vue.component('links-sender', {
  data() {
    return {
      unavaliableLinks: [],
      input: '',
      adding: false
    };
  },
  methods: {
    async playlistAdd() {
      if (this.input.length === 0) return;
      try {
        this.adding = true;
        const res = this.$store.dispatch('addContent', this.input.split(','));
        this.adding = false;
        if (!res.ok) return;
        this.unavaliableLinks = await res.json();
        this.input = '';
        setTimeout(() => {
          this.clearUnavaliableLinks();
        }, 30000);
      } catch (e) {
        this.adding = false;
        console.error(e);
      }
    },
    clearUnavaliableLinks() {
      this.unavaliableLinks = [];
    },
    isUnavaliableLinksEmpty() {
      return this.unavaliableLinks.length === 0;
    }
  },
  template: `
  <div class="links-sender">
    <form action="#" @submit.prevent="playlistAdd">
      <div class="field has-addons">
        <div class="control is-expanded">
          <input
            v-model="input"
            class="input"
            type="text"
            :disabled="adding"
            placeholder="e.g. 'https://youtu.be/id1, https://youtu.be/id2'">
        </div>
        <p class="control">
          <button type="submit" class="button send-button"
            :class="{
              'is-loading': adding
            }"
            :disabled="!input.length || adding">
            <i class="material-icons">send</i>
          </button>
        </p>
      </div>
      <div v-if="!isUnavaliableLinksEmpty()" class="field">
        <div class="message is-danger">
          <div class="message-body error-msg">
            <div v-for="link in unavaliableLinks">
              '{{ link.link }}' => '{{ link.errMsg }}'
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
  `
});
