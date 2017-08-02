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
    <div v-if="!is_unavaliable_links_empty()">
      <div class="card">
        <div class="card-content error-msg">
          <div v-for="link in unavaliable_links">
            '{{ link.link }}' => '{{ link.err_msg }}'
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-content">
        <div class="container">
            <div class="field has-addons">
              <div class="control is-expanded">
                <input v-model="input" @keyup.enter="playlist_add()" class="input" type="text" placeholder="Please enter the link you want to add to the playlist.  e.g. 'https://youtu.be/id1, https://youtu.be/id2'">
              </div>
              <p class="control">
                <a class="button send-button" @click="playlist_add()"
                  :disabled="!input.length || adding">
                  <i class="material-icons">send</i>
                </a>
              </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
});
