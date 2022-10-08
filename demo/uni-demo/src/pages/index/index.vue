<template>
  <view class="content">
    <posterView :json="json" />
  </view>
</template>

<script>
import PosterView from "../../@local_modules/super-poster/dist/components/uni/posterView";
import { getPoster } from "../../@local_modules/super-poster/dist";
export default {
  data() {
    return {
      json: {
        width: 750, //画布宽度
        height: 1125, //画布高度
        displayWidth: 690, //展示宽度
        ratio: 1.5, // 画笔缩放比
        posterFileName: "poster1",
        useCanvas: "offscreenCanvas",
        doms: [
          {
            type: "text", //dom类型
            x: 0, //x坐标
            y: 56, //y坐标
            width: 750, //文本宽度
            value: "宇宙最强最强的小分队", //文本内容
            fontSize: 48, //字体大小
            color: "#212224", //文本颜色
            fontWeight: "bold", //字重
            lineNum: 1, //行数
            textAlign: "center", //左右对其方式
            borderColor: "#000", //文字描边颜色
            borderWidth: 0, //文字描边宽度
            rotate: 0, //旋转角度
            zIndex: 10,
          },
        ],
      },
    };
  },
  components: {
    PosterView,
  },
  onLoad() {
    getPoster(this.json).then((res) => {
      console.log(res, 111);
    });
  },
  methods: {},
};
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin: 200rpx auto 50rpx auto;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
