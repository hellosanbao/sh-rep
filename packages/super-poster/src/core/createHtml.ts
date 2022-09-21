import { PosterOptions } from "../types";
import { deepClone, getTextWidth } from "../utils/utils";

export default {
  domResultList: [],
  parseStyle(obj: any) {
    let arr = [];
    for (let i in obj) {
      arr.push(i + ":" + obj[i]);
    }
    return arr.join(";");
  },
  drawSingleText(v: any, ratio: number, config: PosterOptions) {
    let obj: any = {};
    obj.tag = "text";
    obj.value = v.value;
    const {
      x = 0,
      y = 0,
      width = config.width,
      fontSize,
      fontFamily,
      fontWeight = "normal",
      color = "#000",
      textAlign = "left",
      borderWidth = 0,
      rotate = 0,
      lineNum = 1,
      borderColor = "#000",
      zIndex = 1,
    } = v;
    obj.style = {
      position: "absolute",
      left: `${x * ratio}rpx`,
      top: `${y * ratio}rpx`,
      width: `${width * ratio}rpx`,
      "font-size": `${fontSize * ratio}rpx`,
      "font-family": fontFamily,
      "font-weight": fontWeight,
      color: color,
      "text-align": textAlign,
      "text-shadow": `0 0 ${borderWidth * ratio}rpx ${borderColor}`,
      transform: `rotate(${rotate}deg)`,
      display: "-webkit-box",
      overflow: "hidden",
      "-webkit-box-orient": "vertical",
      "line-clamp": lineNum,
      "-webkit-line-clamp": lineNum, //显示几行
      zIndex,
    };
    obj.styleStr = this.parseStyle(obj.style);
    return obj;
  },
  drawMultiText(v: any, ratio: number, config: PosterOptions) {
    const {
      x = 0,
      y = 0,
      width = config.width,
      textAlign = "left",
      texts = [],
      zIndex = 1,
    } = v;
    let obj: any = {
      tag: "texts",
      style: {
        position: "absolute",
        left: `${x * ratio}rpx`,
        top: `${y * ratio}rpx`,
        width: `${width * ratio}rpx`,
        display: "flex",
        "justify-content": textAlign,
        "align-items": "center",
        zIndex,
      },
    };
    obj.doms = texts.map((item: any) => {
      let dom: any = {
        value: item.value,
        style: {
          "font-size": `${item.fontSize * ratio}rpx`,
          "font-weight": item.fontWeight,
          color: item.color,
        },
      };
      dom.styleStr = this.parseStyle(dom.style);
      return dom;
    });
    obj.styleStr = this.parseStyle(obj.style);
    console.log(obj);
    return obj;
  },
  drawImage(v: any, ratio: number, config: PosterOptions) {
    let {
      url,
      x = 0,
      y = 0,
      width = config.width,
      height = config.height,
      borderWidth = 0,
      borderColor = "#000",
      rotate = 0,
      borderRadius = [],
      zIndex = 1,
      beforeText,
    } = v;
    if (beforeText) {
      const { value, fontSize, width: maxWidth } = beforeText;
      let textWidth = getTextWidth(value, fontSize);
      if (textWidth > maxWidth) {
        x = x + maxWidth;
      } else {
        x = x + textWidth;
      }
    }
    let rectObj: any = null;
    let obj: any = {};
    obj.tag = "image";
    obj.src = url;
    obj.style = {
      position: "absolute",
      left: `${x * ratio}rpx`,
      top: `${y * ratio}rpx`,
      display: "block",
      width: `${width * ratio}rpx`,
      height: `${height * ratio}rpx`,
      "text-shadow": `0 0 ${borderWidth * ratio}rpx ${borderColor}`,
      transform: `rotate(${rotate}deg)`,
      "border-radius": borderRadius.reduce(
        (tol: any, cur: any) => tol + (cur + "rpx "),
        ""
      ),
      zIndex,
    };
    if (v.hasOwnProperty("clip")) {
      delete obj.style["border-radius"];
      let polygon = v.clip.map((v: any) => {
        let formatV = [`${(v[0] - x) * ratio}rpx`, `${(v[1] - y) * ratio}rpx`];
        return formatV.join().split(",").join(" ").toString();
      });
      obj.style["clip-path"] = `polygon(${polygon})`;
      //绘制多边形边框
      if (borderWidth) {
        v.width += borderWidth * 2;
        v.height += borderWidth * 2;
        v.clip.forEach((p: any) => {
          p[0] = ((p[0] - x) / width) * v.width + x;
          p[1] = ((p[1] - y) / height) * v.height + y;
        });
        rectObj = this.drawRect(v, ratio, config);
        rectObj.style.display = "flex";
        rectObj.style["align-items"] = "center";
        rectObj.style["justify-content"] = "center";
        rectObj.styleStr = this.parseStyle(rectObj.style);
        obj.style.position = "static";
        obj.style["margin-right"] = `${(borderWidth / 2) * ratio}rpx`;
      }
    }
    obj.styleStr = this.parseStyle(obj.style);
    if (rectObj) {
      rectObj.doms = [obj];
      return rectObj;
    } else {
      return obj;
    }
  },
  drawRect(v: any, ratio: number, config: PosterOptions) {
    const {
      borderRadius = [],
      x = 0,
      y = 0,
      width = config.width,
      height = config.height,
      borderWidth = 0,
      borderColor = "#000",
      rotate = 0,
      zIndex,
    } = v;
    let obj: any = {};
    obj.tag = "view";
    obj.style = {
      position: "absolute",
      left: `${x * ratio}rpx`,
      top: `${y * ratio}rpx`,
      width: `${width * ratio}rpx`,
      height: `${height * ratio}rpx`,
      "text-shadow": `0 0 ${borderWidth * ratio}rpx ${borderColor}`,
      transform: `rotate(${rotate}deg)`,
      "border-radius": borderRadius.reduce(
        (tol: any, cur: any) => tol + (cur + "rpx "),
        ""
      ),
      background: "#000",
      zIndex,
    };
    if (v.hasOwnProperty("clip")) {
      delete obj.style["border-radius"];
      let polygon = v.clip.map((v: any) => {
        let formatV = [`${(v[0] - x) * ratio}rpx`, `${(v[1] - y) * ratio}rpx`];
        return formatV.join().split(",").join(" ").toString();
      });
      obj.style["clip-path"] = `polygon(${polygon})`;
    }
    obj.styleStr = this.parseStyle(obj.style);
    return obj;
  },
  drawBlock(v: any, ratio: number, config: PosterOptions) {
    const {
      x = 0,
      y = 0,
      width = config.width,
      height = config.height,
      borderWidth = 0,
      borderColor = "#000",
      rotate = 0,
      borderRadius = [],
      doms = [],
      zIndex = 1,
    } = v;
    const vDoms = doms.map((item: any) => {
      item.x = item.x - x;
      item.y = item.y - y;
      return item;
    });
    let obj: any = {
      tag: "block",
      style: {
        position: "absolute",
        left: `${x * ratio}rpx`,
        top: `${y * ratio}rpx`,
        width: `${width * ratio}rpx`,
        height: `${height * ratio}rpx`,
        "text-shadow": `0 0 ${borderWidth * ratio}rpx ${borderColor}`,
        transform: `rotate(${rotate}deg)`,
        "border-radius": borderRadius.reduce(
          (tol: any, cur: any) => tol + (cur + "rpx "),
          ""
        ),
        transformOrigin: "center center",
        zIndex,
      },
    };
    obj.doms = this.handleDoms(vDoms, config, false);
    obj.styleStr = this.parseStyle(obj.style);
    return obj;
  },
  handleDoms(doms: any, config: PosterOptions, pushRoot = true) {
    let domResultList: any = [];
    const { displayWidth, width } = config;
    let ratio = displayWidth / width;
    doms?.forEach((v: any) => {
      switch (v.type) {
        case "text":
          domResultList.push(this.drawSingleText(v, ratio, config));
          break;
        case "texts":
          domResultList.push(this.drawMultiText(v, ratio, config));
          break;
        case "image":
          domResultList.push(this.drawImage(v, ratio, config));
          break;
        case "rect":
          domResultList.push(this.drawRect(v, ratio, config));
        case "block":
          domResultList.push(this.drawBlock(v, ratio, config));
          break;
      }
    });
    if (pushRoot) {
      this.domResultList = this.domResultList.concat(domResultList);
    }
    return domResultList;
  },
  sortDoms(doms: any) {
    return doms
      .map((dom: any) => {
        dom.zIndex = dom.zIndex || 0;
        if (dom.doms?.length) {
          dom.doms = this.sortDoms(dom.doms);
        }
        return dom;
      })
      .sort((a: any, b: any) => a.zIndex - b.zIndex);
  },
  parseJson(config: any = {}) {
    config = deepClone(config);
    this.domResultList = [];
    const { doms } = config;
    this.handleDoms(this.sortDoms(doms), config);
    return this.domResultList;
  },
};
