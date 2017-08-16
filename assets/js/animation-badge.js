Vue.component('animation-badge', {
  props: ['number'],
  data() {
    return {
      isChanging: false,
      isIncreasing: false,
      isDecreasing: false
    };
  },
  computed: {
    duration() {
      return (
        document.defaultView
          .getComputedStyle(this.$el, '')['transition-duration']
          .replace('s', '') * 1000
      );
    }
  },
  watch: {
    number(value, oldValue) {
      this.isChanging = true;
      this.isIncreasing = value > oldValue;
      this.isDecreasing = value < oldValue;
      setTimeout(() => {
        this.isChanging = false;
        this.isIncreasing = false;
        this.isDecreasing = false;
      }, this.duration);
    }
  },
  template: `
  <span class="tag is-light animation-badge is-rounded"
        :class="{
          'is-changing': isChanging,
          'is-increasing': isIncreasing,
          'is-decreasing': isDecreasing
        }">
    {{ number }}
  </span>`
});
