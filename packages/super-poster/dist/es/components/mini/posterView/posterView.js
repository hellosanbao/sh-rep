import { getPreview } from "@sh-rep/super-poster";
Component({
  properties: {
    json: {
      type: Object,
      value: {},
    },
  },
  data: {
    html: [],
  },
  ready() {
    let html = getPreview(this.data.json) || [];
    this.setData({
      html,
    });
  },
});
