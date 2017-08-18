Vue.component('history', {
  props: ['data'],
  methods: {
    humanizeTime(seconds) {
      return Util.humanizeTimeFromSeconds(seconds);
    },
    async addContent(idx) {
      try {
        await fetch('/playlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([this.history[idx].track.link])
        });
      } catch (e) {
        console.error(e);
      }
    }
  },
  computed: {
    history() {
      return this.data;
    }
  },

  template: `
  <div class="scroll-view-wrapper history">
    <div class="scroll-view">
      <div class="tracks">
        <a v-for="(content,idx) in history" class="panel-block history-content is-paddingless"
          :title="content.track.title"
          >
          <div class="control columns is-marginless is-mobile">
            <div class="column is-1 align-self-center has-text-centered is-paddingless-vertical thumbnail-wrapper">
              <img :src="content.track.thumbnailLink" class="is-block">
            </div>
            <div class="column is-7 history-content-title-wrapper">
              <span class="tag is-light play-count is-rounded">{{ content.playCount }}</span>
              <span class="history-title">{{ content.track.title }}</span>
            </div>
            <div class="column has-text-centered is-2">
              {{ humanizeTime(content.track.lengthSeconds) }}
            </div>
            <div class="column is-1 has-text-centered align-self-center is-paddingless-vertical">
              <copy-link-button class="is-flex" :link="content.track.link" tooltip-duration="1000"></copy-link-button>
            </div>
            <div class="column is-1 has-text-centered align-self-center is-paddingless-vertical">
              <a class="is-flex in-content-button add-content-button" @click.prevent.stop="addContent(idx)">
                <i class="material-icons icon" title="Add to Playlist">library_add</i>
              </a>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
  `
});
