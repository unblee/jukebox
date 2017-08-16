Vue.component('copy-link-button', {
  props: ['link', 'tooltipDuration'],
  data() {
    return {
      isCopied: false,
      clipboard: null
    };
  },
  created() {
    this.clipboard = new Clipboard('.copy-link-button');
  },
  methods: {
    copyUrl(e) {
      this.clipboard.onClick(e);
      if (this.tooltipDuration) {
        this.isCopied = true;
        setTimeout(() => {
          this.isCopied = false;
        }, this.tooltipDuration);
      }
    }
  },
  template: `
  <a class="in-content-button copy-link-button"
     @click.prevent.stop="copyUrl"
     :data-clipboard-text="link"
     :class="{'copied-tooltip': isCopied}">
    <i class="material-icons icon" title="Copy Link">link</i>
  </a>
 `
});
