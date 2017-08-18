Vue.component('seekbar', {
  props: ['value', 'max'],
  template: `
  <progress class="progress seekbar" :value="value" :max="max"></progress>
 `
});
