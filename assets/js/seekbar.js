Vue.component('seekbar', {
  props: ['value', 'max'],
  data() {
    return {
      reviewSeek: 0,
      reviewSeekPercent: 0,
      enabledReviewSeek: false,
      styleSheet: null
    };
  },
  mounted() {
    const styleEle = document.createElement('style');
    document.head.appendChild(styleEle);
    this.styleSheet = styleEle.sheet;
  },
  computed: {
    reviewSeekTime() {
      return Util.humanizeTimeFromSeconds(Math.floor(this.reviewSeek));
    },
    seekReviewAfterStyle() {
      return `
        .seek-tooltip::after {
          left: calc(${this.reviewSeekPercent}% - 26px);
          width: 52px;
        }
      `;
    },
    seekReviewBeforeStyle() {
      return `
        .seek-tooltip::before {
          left: calc(${this.reviewSeekPercent}% - 6px);
          border-width: 0 6px 6px 6px;
        }
      `;
    }
  },
  watch: {
    reviewSeek() {
      this._updateSeekReviewRules();
    }
  },
  methods: {
    changeSeek() {
      this._changeSeek(this.reviewSeek);
    },
    showReviewSeek() {
      this.enabledReviewSeek = true;
    },
    hideReviewSeek() {
      this.enabledReviewSeek = false;
    },
    calcReviewSeek(e) {
      const p = e.offsetX / this.$el.offsetWidth;
      this.reviewSeekPercent = p * 100;
      this.reviewSeek = p * this.max;
    },
    _updateSeekReviewRules() {
      while (this.styleSheet.cssRules.length) {
        this.styleSheet.deleteRule(0);
      }
      this.styleSheet.insertRule(this.seekReviewAfterStyle, this.styleSheet.cssRules.length);
      this.styleSheet.insertRule(this.seekReviewBeforeStyle, this.styleSheet.cssRules.length);
    },
    ...mapActions({
      _changeSeek: 'changeSeek'
    })
  },
  template: `
  <progress class="progress seekbar"
            :class="{ 'seek-tooltip': enabledReviewSeek }"
            :value="value"
            :max="max"
            @click="changeSeek"
            @mouseenter="showReviewSeek"
            @mousemove="calcReviewSeek" 
            @mouseout="hideReviewSeek"
            :data-review-seek="reviewSeek"
            :data-review-seek-time="reviewSeekTime">
  </progress>
 `
});
