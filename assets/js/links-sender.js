Vue.component("links-sender", {
  data() {
    return {
      unavaliable_links: [],
      input: "",
      adding: false
    };
  },
  methods: {
    async playlist_add() {
      if (this.input.length === 0) return;
      try {
        this.adding = true;
        const res = await fetch("/playlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(this.input.split(","))
        });
        this.adding = false;
        if (!res.ok) return;
        this.unavaliable_links = await res.json();
        this.input = "";
        setTimeout(() => {
          this.clear_unavaliable_links();
        }, 30000);
      } catch (e) {
        this.adding = false;
        console.error(e);
      }
    },
    clear_unavaliable_links() {
      this.unavaliable_links = [];
    },
    is_unavaliable_links_empty() {
      return this.unavaliable_links.length === 0;
    }
  },
  template: `
  <div class="links-sender">
    <form action="#" @submit.prevent="playlist_add">
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
      <div v-if="!is_unavaliable_links_empty()" class="field">
        <div class="message is-danger">
          <div class="message-body error-msg">
            <div v-for="link in unavaliable_links">
              '{{ link.link }}' => '{{ link.err_msg }}'
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
  `
});
