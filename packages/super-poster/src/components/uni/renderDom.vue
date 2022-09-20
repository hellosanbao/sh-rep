<template>
  <block>
    <div v-for="(dom, index) in doms" :key="index + dom.tag">
      <img v-if="dom.tag === 'image'" :src="dom.src" :style="dom.styleStr" />
      <div v-if="dom.tag === 'text'" :style="dom.styleStr">{{ dom.value }}</div>
      <div v-if="dom.tag === 'texts'" :style="dom.styleStr">
        <div v-for="text in dom.doms" :key="text.value" :style="text.styleStr">
          {{ text.value }}
        </div>
      </div>
      <div
        v-if="dom.tag === 'block' || dom.tag === 'view'"
        :style="dom.styleStr"
      >
        <renderDom :doms="dom.doms || []" />
      </div>
    </div>
  </block>
</template>
<script>
import renderDom from "./renderDom.vue";
export default {
  name: "renderDom",
  props: {
    doms: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    renderDom,
  },
  mounted() {},
};
</script>
