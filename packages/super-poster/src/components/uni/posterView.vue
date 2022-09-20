<template>
  <div
    class="poster_view-container"
    :style="{
      width: json.displayWidth + 'rpx',
      height: (json.displayWidth / json.width) * json.height + 'rpx',
    }"
  >
    <renderDoms :doms="html" />
  </div>
</template>
<script>
import { getPreview } from "@sh-rep/super-poster";
import renderDoms from "./renderDom.vue";
export default {
  props: {
    json: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    renderDoms,
  },
  data() {
    return {
      html: [],
    };
  },
  mounted() {
    this.html = getPreview(this.json) || [];
  },
};
</script>
<style>
.poster_view-container {
  position: relative;
}
</style>
