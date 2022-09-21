import { ins } from "../utils/canvas";
import { deepClone } from "../utils/utils";

import {
  PosterOptions,
  PosImage,
  Doms,
  PosText,
  PosTextGroup,
  PosBlock,
} from "../types";

export default {
  //创建图片
  async createImages(dom: PosImage, config: PosterOptions, ins: any) {
    let {
      url,
      x = 0,
      y = 0,
      width = 0,
      height = 0,
      rotate = 0,
      borderRadius = [],
      clip,
      borderWidth = 0,
      borderColor = 0,
      beforeText,
    } = dom;
    let radius = borderRadius[0] || 0;
    if (beforeText) {
      const { value, fontSize, fontWeight, width: maxWidth } = beforeText;
      let ellipsText = ins.getEllipsisText(
        value,
        fontSize,
        maxWidth,
        fontWeight
      );
      x += ins.getTextWidth(ellipsText, fontSize, fontWeight) / config.ratio;
    }
    if (clip) {
      //多边形图片
      let polygon = {
        imgObj: {
          url,
          x: x * ins.ratio,
          y: y * ins.ratio,
          w: width * ins.ratio,
          h: height * ins.ratio,
        },
        points: clip.map((v) => ({ x: v[0] * ins.ratio, y: v[1] * ins.ratio })),
        strokeObj: {
          lineWidth: borderWidth,
          strokeStyle: borderColor,
        },
      };
      await ins.drawPolygon(polygon);
    } else {
      await ins.drawRoundImage(
        url,
        x * ins.ratio,
        y * ins.ratio,
        width * ins.ratio,
        height * ins.ratio,
        radius * ins.ratio,
        rotate
      );
    }
    ins.ctx.restore();
  },

  //创建文本
  async createText(dom: PosText, config: PosterOptions, ins: any) {
    let {
      value,
      x,
      y,
      width = config.width,
      color = "#000",
      fontWeight,
      fontSize,
      textAlign,
      rotate = 0,
      lineNum,
    } = dom;
    let [relX, relY, relWidth, relFontSize] = [
      x * ins.ratio,
      y * ins.ratio,
      width * ins.ratio,
      fontSize * ins.ratio,
    ];
    if (textAlign === "center") {
      relX = relX + relWidth / 2;
    } else if (textAlign === "right") {
      relX = relX + relWidth;
    }
    await ins.drawText(
      value + "",
      relX,
      relY + relFontSize,
      color,
      fontWeight,
      relFontSize,
      textAlign,
      rotate,
      relWidth,
      lineNum
    );
  },

  //创建多规格文本
  async createTexts(dom: PosTextGroup, config: PosterOptions, ins: any) {
    let textArr = dom.texts.map((text) => {
      return {
        txt: text.value,
        size: text.fontSize * ins.ratio,
        color: text.color,
        weight: text.fontWeight,
      };
    });
    const domY =
      dom.y + dom.texts.sort((a, b) => b.fontSize - a.fontSize)[0].fontSize;
    await ins.drawDiffTexts(textArr, domY * ins.ratio, {
      x: dom.x * ins.ratio,
      w: dom.width * ins.ratio,
      align: dom.textAlign,
    });
  },

  //创建dom块
  async createBlock(dom: PosBlock, config: PosterOptions, ins: any) {
    const { rotate, rotateOrigin = [0, 0], translate = [0, 0] } = dom;
    ins.ctx.save();
    if (rotate) {
      const [originX, originY] = rotateOrigin;
      ins.rotate(dom.rotate, originX * ins.ratio, originY * ins.ratio);
    }
    ins.ctx.translate(...translate.map((i) => i * ins.ratio));
    await this.handlerDoms(dom.doms, config, ins);
    ins.ctx.restore();
  },

  sortDoms(doms) {
    return doms
      .map((dom) => {
        dom.zIndex = dom.zIndex || 0;
        if (dom.doms.length) {
          dom.doms = this.sortDoms(dom.doms);
        }
        return dom;
      })
      .sort((a, b) => a.zIndex - b.zIndex);
  },

  async handlerDoms(doms: Doms, config: PosterOptions, ins: any) {
    doms = this.sortDoms(doms);
    //并行加载所有图片
    await ins.depImgs(
      doms.filter((d) => d.type === "image").map((d) => (d as PosImage).url)
    );
    for (let [, dom] of doms.entries()) {
      switch (dom.type) {
        case "image":
          await this.createImages(dom, config, ins);
          break;
        case "text":
          await this.createText(dom, config, ins);
          break;
        case "texts":
          await this.createTexts(dom, config, ins);
          break;
        case "block":
          await this.createBlock(dom, config, ins);
          break;
        default:
          break;
      }
    }
  },

  async draw(config: PosterOptions, depImgs = []) {
    config = deepClone(config);
    let { width, height, ratio = 1, posterFileName, doms = [] } = config;
    let [relWidth, relHeight] = [width * ratio, height * ratio];
    await ins.getContext("#posterCanvas", relWidth, relHeight, ratio);
    await ins.depImgs(depImgs);
    ins.ctx.clearRect(0, 0, relWidth, relHeight);
    await this.handlerDoms(doms, config, ins);

    //获取图片本地链接
    async function getTempFilePath() {
      let imgSrc = ins.getDataUrl();
      let tempFilePath = await ins.getTempFilePath(imgSrc, posterFileName);
      return tempFilePath;
    }
    return { ins, getTempFilePath };
  },
};
