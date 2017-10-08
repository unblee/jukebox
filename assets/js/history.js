Vue.component('history', {
  computed: mapState(['history']),
  template: `
  <div class="scroll-view-wrapper history">
    <div class="scroll-view">
      <div class="tracks">
        <playlist-item v-for="(content, idx) in history" mode="history" :track="content" :idx="idx" />
      </div>
    </div>
  </div>
  `
});
