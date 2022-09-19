// import { createOffscreenCanvas, getFileSystemManager, showToast } from '@tarojs/taro';
import { removeTempFile } from "./utils";
import { toArray } from "./emoji";

const { createOffscreenCanvas, getFileSystemManager, showToast } = wx;

const depImageLoadeds: any[] = [];
export default class CreateOffScreenCanvas {
  public width: number;
  public height: number;
  public ratio: number;
  public fileList: Set<string>;
  public filePathPrefix: string;
  public canvas: any;
  public ctx: any;

  constructor(width = 750, height = 1125, ratio = 2) {
    this.width = width * ratio;
    this.height = height * ratio;
    this.ratio = ratio; // 放大比例
    this.fileList = new Set(); // tempFile 文件集合
    this.filePathPrefix = wx.env.USER_DATA_PATH + "/pic"; //存储临时文件的路径前缀
  }
  async getContext(id: string, width: number, height: number, ratio: number) {
    if (ratio) this.ratio = ratio; // 放大比例
    if (width) this.width = width * ratio;
    if (height) this.height = height * ratio;
    this.canvas = createOffscreenCanvas({
      type: "2d",
      width: this.width,
      height: this.height,
    });
    this.ctx = this.canvas.getContext("2d");
    let isCanvasComponent =
      this.canvas.width != this.width || this.canvas.height != this.height;
    if (isCanvasComponent) {
      console.log("------------------采用canvas组件-----------------");
      return new Promise((resolve, reject) => {
        const query = wx.createSelectorQuery();
        query
          .select(id)
          .fields({
            node: true,
            size: true,
          })
          .exec((res: any) => {
            const canvas = res[0].node;
            canvas.width = this.width;
            canvas.height = this.height;
            this.canvas = canvas;
            console.log(this.canvas);
            this.ctx = this.canvas.getContext("2d");
            resolve(this);
          });
      });
    } else {
      console.log("------------------采用离屏渲染-----------------");
      return this;
    }
  }

  drawReact = (x: number, y: number, w: number, h: number, style: string) => {
    this.ctx.fillStyle = style;
    this.ctx.fillRect(
      x * this.ratio,
      y * this.ratio,
      w * this.ratio,
      h * this.ratio
    );
  };
  /**
   * 绘制圆角矩形
   * @param {number} x 圆角矩形左上角的x坐标
   * @param {number} y 圆角矩形左上角的y坐标
   * @param {number} w 圆角矩形的宽度
   * @param {number} h 圆角矩形的高度
   * @param {string} style 圆角矩形的填充样式
   * @param {[]number | number} rounds 圆角矩形的圆角大小 [topLeft, topRight, bottomRight, bottomLeft]
   */
  drawRoundReact = (
    ox: number,
    oy: number,
    ow: number,
    oh: number,
    style = "#000",
    rounds = [0, 0, 0, 0]
  ) => {
    const ctx = this.ctx;
    let [lt, rt, rb, lb] = [0, 0, 0, 0];
    if (Array.isArray(rounds)) {
      [lt, rt, rb, lb] = rounds.map((i) => i * this.ratio);
    } else {
      [lt, rt, rb, lb] = new Array(4).fill(rounds * this.ratio);
    }
    let [x, y, w, h] = [
      ox * this.ratio,
      oy * this.ratio,
      ow * this.ratio,
      oh * this.ratio,
    ];

    ctx.beginPath();
    ctx.moveTo(x + lt, y);
    ctx.lineTo(x + w - rt, y);
    if (rt) {
      ctx.arcTo(x + w, y, x + w, y + rt, rt);
    }
    ctx.lineTo(x + w, y + h - rb);
    if (rb) {
      ctx.arcTo(x + w, y + h, x + w - rb, y + h, rb);
    }
    ctx.lineTo(x + lb, y + h);
    if (lb) {
      ctx.arcTo(x, y + h, x, y + h - lb, lb);
    }
    ctx.lineTo(x, y + lt);
    if (lt) {
      ctx.arcTo(x, y, x + lt, y, lt);
    }
    ctx.fillStyle = style;
    ctx.fill();
  };
  drawLinearGradientReact = (
    x: number,
    y: number,
    w: number,
    h: number,
    dur = "y",
    start: number,
    stop: number
  ) => {
    let grad;
    if (dur == "y") {
      grad = this.ctx.createLinearGradient(
        x * this.ratio,
        y * this.ratio,
        x * this.ratio,
        (y + h) * this.ratio
      ); //创建一个渐变色线性对象
    } else {
      grad = this.ctx.createLinearGradient(
        x * this.ratio,
        y * this.ratio,
        (x + w) * this.ratio,
        y * this.ratio
      ); //创建一个渐变色线性对象
    }
    grad.addColorStop(0, start); //定义渐变色颜色
    grad.addColorStop(1, stop);
    this.ctx.fillStyle = grad; //设置fillStyle为当前的渐变对象
    this.ctx.fillRect(
      x * this.ratio,
      y * this.ratio,
      w * this.ratio,
      h * this.ratio
    );
  };

  //获取超出省略的文字
  getEllipsisText(
    text: string,
    fontSize: number,
    maxWidth: number,
    fontWeight = "normal"
  ) {
    let textUnicodeArray = toArray(text) || text; //防止emoji表情被折断
    let relTxt = []; //防止slice的时候emoji被截断
    for (let n = 0; n < textUnicodeArray.length; n++) {
      if (
        this.getTextWidth(relTxt.join(""), fontSize, fontWeight) <
        maxWidth * this.ratio
      ) {
        relTxt.push(textUnicodeArray[n]);
      } else {
        relTxt.splice(relTxt.length - 1, 1, "...");
        return relTxt.join("");
      }
    }
    return relTxt.join("");
  }
  //获取折行的文本
  getBreakWords(
    text: string,
    fontSize: number,
    maxWidth: number,
    fontWeight = "normal"
  ) {
    let textUnicodeArray = toArray(text) || text; //防止emoji表情被折断
    let arr = [];
    let relTxt = "";
    for (let n = 0; n < textUnicodeArray.length; n++) {
      relTxt += textUnicodeArray[n];
      if (
        this.getTextWidth(relTxt, fontSize, fontWeight) >=
        maxWidth * this.ratio
      ) {
        arr.push(relTxt);
        relTxt = "";
      }
    }
    relTxt && arr.push(relTxt);
    return arr;
  }
  /**
   * 绘制文字
   * @param {string} txt 文本
   * @param {number｜string} x x坐标
   * @param {number｜string} y y坐标
   * @param {string} style 文本颜色
   * @param {string} bold  字重
   * @param {number｜string} size 文本大小
   * @param {string} align  对齐方式 left center right
   * @param {number｜string} angle 文本旋转角度
   * @param {number} maxWidth  //文本展示的最大宽度
   * @param {number} ellipsis  //超出省略号(不传则自动换黄)
   * @param {number} verticalAlign  //垂直剧中对齐
   * @returns
   */
  drawText = (
    txt = "",
    x: number,
    y: number,
    style = "#ffffff",
    bold = "normal",
    size = 16,
    align = "left",
    angle = 0,
    maxWidth = null,
    ellipsis = null,
    verticalAlign = "top"
  ) => {
    this.ctx.font = `${bold} ${size * this.ratio}px normal `;
    this.ctx.fillStyle = style;
    this.ctx.textAlign = align;
    if (maxWidth != null) {
      if (ellipsis) {
        // 省略号
        txt = this.getEllipsisText(txt, size, maxWidth, bold);
      } else {
        //自动换行
        let textarr = this.getBreakWords(txt, size, maxWidth);
        for (let i = 0; i < textarr.length; i++) {
          let txY = y * this.ratio + size * this.ratio * 1.2 * i;
          if (verticalAlign === "center") {
            txY = txY - (textarr.length * size * this.ratio) / 2;
          }
          this.ctx.fillText(textarr[i], x * this.ratio, txY);
        }
        return;
      }
    }
    if (angle) {
      // let { width } = this.ctx.measureText(txt);
      this.ctx.save();
      this.ctx.translate(x * this.ratio, y * this.ratio);
      this.ctx.rotate((angle * Math.PI) / 180);
      this.ctx.fillStyle = style;
      this.ctx.fillText(txt, 0, 0);
      this.ctx.restore();
      return;
    }
    this.ctx.fillText(txt, x * this.ratio, y * this.ratio);
  };

  drawStrokeText = (
    txt = "",
    x: number,
    y: number,
    fillColor = "#FFFFFF",
    strokeColor = "#FFFFFF",
    size = 16,
    align = "left",
    lineWidth = 5,
    angle = 0
  ) => {
    this.ctx.font = `bold ${size * this.ratio}px normal`;
    this.ctx.textAlign = align;
    this.ctx.lineWidth = lineWidth * this.ratio;
    this.ctx.fillStyle = fillColor;
    this.ctx.strokeStyle = strokeColor;
    this.ctx.save();
    this.ctx.translate(x * this.ratio, y * this.ratio);
    this.ctx.rotate((angle * Math.PI) / 180);
    this.ctx.strokeText(txt, 0, 0);
    this.ctx.fillText(txt, 0, 0);
    this.ctx.restore();
  };
  /**
   * 绘制不同大小的文字
   * @param {[ { txt:string,size:number,color:string,weight:string,angle?:number,lineWidth?:number,fillColor?:string,strokeColor?:string} ]} textArr 文字列表
   * @param {number} y
   * @param {{x:number,w:number,align:'center'|'left'}} startObj? 起始位置信息
   */
  drawDiffTexts = (textArr: any[], y: number, startObj: any) => {
    let widthList = textArr.map((item) => {
      this.ctx.font = `${item.weight || "normal"} ${
        item.size * this.ratio
      }px normal`;
      if (item.lineWidth) {
        return (
          this.ctx.measureText(item.txt).width + item.lineWidth * 2 * this.ratio
        );
      }
      return this.ctx.measureText(item.txt).width;
    });
    let startP: any;
    if (startObj) {
      let x = startObj.x * this.ratio;
      let w = startObj.w * this.ratio;
      if (startObj.align == "center") {
        startP = w / 2 - widthList.reduce((cur, nex) => cur + nex, 0) / 2 + x;
      } else if (startObj.align == "left") {
        startP = x;
      }
    } else {
      // 没有传入其实位置信息 默认画布居中
      startP =
        this.width / 2 - widthList.reduce((cur, nex) => cur + nex, 0) / 2;
    }
    textArr.forEach((item, index) => {
      if (item.lineWidth) {
        this.drawStrokeText(
          item.txt,
          startP / this.ratio,
          item.y ? item.y : y,
          item.fillColor,
          item.strokeColor,
          item.size,
          "left",
          item.lineWidth,
          item.angle || 0
        );
      } else {
        this.drawText(
          item.txt,
          startP / this.ratio,
          item.y ? item.y : y,
          item.color,
          item.weight || "normal",
          item.size,
          "left",
          item.angle || 0
        );
      }
      startP += widthList[index];
    });
  };
  loadImage = async (url: string) => {
    let img = this.canvas.createImage();
    return new Promise((resolve) => {
      img.onload = () => {
        resolve({ img, url });
      };
      img.src = url;
    });
  };
  depImgs = async (imgs: any[]) => {
    let res = await Promise.all(
      imgs.map((i) => {
        let fin = [...depImageLoadeds].find((item) => item.url === i);
        if (fin) {
          return fin;
        }
        return this.loadImage(i);
      })
    );
    depImageLoadeds.push(...res);
  };
  drawImg = async (url: string, x: number, y: number, w: number, h: number) => {
    let img = this.canvas.createImage();
    let res = [...depImageLoadeds].find((item) => item.url === url);
    if (res) {
      img = res.img;
    } else {
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = url;
      });
      let resImage: any = await this.loadImage(url);
      img = resImage.img;
      depImageLoadeds.push(resImage);
    }

    this.ctx.drawImage(
      img,
      x * this.ratio,
      y * this.ratio,
      w * this.ratio,
      h * this.ratio
    );
  };
  drawAvatar = async (
    url: string,
    x: number,
    y: number,
    r: number,
    fillStyle = "#ffffff"
  ) => {
    this.ctx.beginPath();
    this.ctx.arc(
      (x + r) * this.ratio,
      (y + r) * this.ratio,
      r * this.ratio + 5,
      0,
      2 * Math.PI,
      false
    );
    this.ctx.fillStyle = fillStyle;
    this.ctx.fill();

    this.ctx.save();
    // 头像
    this.ctx.beginPath();
    this.ctx.arc(
      (x + r) * this.ratio,
      (y + r) * this.ratio,
      r * this.ratio,
      0,
      2 * Math.PI,
      false
    );
    this.ctx.clip(); //画好了圆 剪切 原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因
    this.ctx.beginPath();
    this.ctx.arc(
      (x + r) * this.ratio,
      (y + r) * this.ratio,
      r * this.ratio,
      0,
      2 * Math.PI,
      false
    );
    await this.drawImg(url, x, y, r * 2, r * 2);
    this.ctx.restore();
  };
  // 画多边形 或多边形图片
  /**
   *
   * @param {
   *          imgObj:{url:string,x:number,y:number,w:number,h:number}, 图片对象
   *          points:{x:number,y:number}[], 点位 (第一项是起始位置)
   *          strokeObj?:{lineWidth:number,strokeStyle:string}, 描边信息
   *          fillStyle?:string 填充信息
   *        }
   *
   */
  drawPolygon = async (polygon: any) => {
    polygon.imgObj && this.ctx.save();
    this.ctx.beginPath();
    for (let [index, point] of polygon.points.entries()) {
      if (index) {
        this.ctx.lineTo(point.x * this.ratio, point.y * this.ratio);
      } else {
        this.ctx.moveTo(point.x * this.ratio, point.y * this.ratio);
      }
    }
    this.ctx.closePath();
    if (polygon.strokeObj) {
      this.ctx.lineWidth = polygon.strokeObj.lineWidth * this.ratio;
      this.ctx.strokeStyle = polygon.strokeObj.strokeStyle;
      this.ctx.stroke();
    }
    if (polygon.imgObj) {
      this.ctx.clip();
      await this.drawImg(
        polygon.imgObj.url,
        polygon.imgObj.x,
        polygon.imgObj.y,
        polygon.imgObj.w,
        polygon.imgObj.h
      );
      this.ctx.restore();
    } else {
      this.ctx.fillStyle = polygon.fillStyle;
      this.ctx.fill();
    }
  };
  /**
   * 绘制圆角图片
   * @param {string} imgSrc 图片地址
   * @param {number} ox 图片x坐标
   * @param {number} oy 图片y坐标
   * @param {nnumber} ow 图片宽度
   * @param {number} oh 图片高度
   * @param {number} or 圆角半径
   * @param {number} angle 图片旋转角度
   */
  drawRoundImage = async (
    imgSrc: string,
    ox: number,
    oy: number,
    ow: number,
    oh: number,
    or = 0,
    angle = 0
  ) => {
    let [x, y, w, h, r] = [
      ox * this.ratio,
      oy * this.ratio,
      ow * this.ratio,
      oh * this.ratio,
      or * this.ratio,
    ];
    const ctx = this.ctx;
    if (w < this.ratio * r) {
      r = w / 2;
    }
    if (h < this.ratio * r) {
      r = h / 2;
    }
    ctx.save();
    this.rotate(angle, ox + ow / 2, oy + ow / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.clip();
    await this.drawImg(imgSrc, ox, oy, w / this.ratio, h / this.ratio);
    ctx.restore();
  };
  /**
   * 旋转元素
   * @param {number} angle 旋转角度
   * @param {number} x 旋转中心x坐标
   * @param {number} y 旋转中心y坐标
   * @param {number} radio 坐标比例，如果传2，则x、y都会乘以2
   * @returns
   */
  rotate = async (angle: number, x = 0, y = 0) => {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x * this.ratio, y * this.ratio);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-x * this.ratio, -y * this.ratio);
  };
  /**
   * 获取文字的大小
   * @param {string} str 要测试的字符串
   * @param {number} fontSize 字符串的字体大小
   * @returns {number} 测量字符串的长度
   */
  getTextWidth(str: string, fontSize: number, fontWeight = "normal") {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = `${fontSize * this.ratio}px ${fontWeight}`;
    let width = ctx.measureText(str).width;
    ctx.restore();

    return width || 0;
  }
  /**
   * 获取文字集合的总长度
   * @param { {txt:string; size:number}[] } texts 文字集合
   */
  getTextsWidthTotal(texts: any) {
    return texts.reduce((total: any, cur: any) => {
      return total + this.getTextWidth(cur.txt, cur.size);
    }, 0);
  }
  havePoint(val: any) {
    return val.indexOf(".") >= 0;
  }
  getDataUrl = () => {
    return this.ctx.canvas.toDataURL("image/jpg", 1);
  };
  getTempFilePath = (imgSrc: string, number: number | string) => {
    return new Promise((resolve, reject) => {
      // const number = Math.random();
      const manger = getFileSystemManager();
      const filePath = this.filePathPrefix + number + ".png";
      if (this.fileList.has(filePath)) {
        resolve(filePath);
        return;
      }
      manger.writeFile({
        filePath, // 表示生成一个临时文件名
        data: imgSrc.slice(22),
        encoding: "base64",
        success: () => {
          this.fileList.add(filePath);
          console.log(this.fileList);
          resolve(filePath);
        },
        fail: (err: any) => {
          reject(err);
          showToast({ title: "图片加载失败，请稍后再试~" });
        },
      });
    });
  };
  // 清空缓存图片
  removeTempFilePath = (url: string) => {
    try {
      removeTempFile(url);
    } catch (error) {}
    if (url) {
      return this.fileList.delete(url);
    }
    this.fileList.clear();
  };
}
export const ins = new CreateOffScreenCanvas();
