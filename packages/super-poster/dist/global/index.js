var superPoster = (function (exports) {
    'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    // import { getFileSystemManager } from '@tarojs/taro';
    const { getFileSystemManager: getFileSystemManager$1 } = wx;
    function deepClone(target) {
        // 定义一个变量
        let result;
        // 如果当前需要深拷贝的是一个对象的话
        if (typeof target === 'object') {
            // 如果是一个数组的话
            if (Array.isArray(target)) {
                result = []; // 将result赋值为一个数组，并且执行遍历
                for (const i in target) {
                    // 递归克隆数组中的每一项
                    result.push(deepClone(target[i]));
                }
                // 判断如果当前的值是null的话；直接赋值为null
            }
            else if (target === null) {
                result = null;
                // 判断如果当前的值是一个RegExp对象的话，直接赋值
            }
            else if (target.constructor === RegExp) {
                result = target;
            }
            else {
                // 否则是普通对象，直接for in循环，递归赋值对象的所有值
                result = {};
                for (const i in target) {
                    result[i] = deepClone(target[i]);
                }
            }
            // 如果不是对象的话，就是基本数据类型，那么直接赋值
        }
        else {
            result = target;
        }
        // 返回最终结果
        return result;
    }
    // 清空缓存中的图片
    const removeTempFile = (url) => {
        const manger = getFileSystemManager$1();
        if (url) {
            return manger.unlink({
                filePath: url,
            });
        }
        const res = manger.readdirSync(wx.env.USER_DATA_PATH);
        res.forEach((val) => {
            if (/\.(png|jpg|jpeg)$/g.test(val)) {
                manger.unlinkSync(`${wx.env.USER_DATA_PATH}/${val}`);
            }
        });
    };
    //获取字符长度
    const getStrLen = (str) => {
        let len = 0;
        let i, c;
        for (i = 0; i < str.length; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                len++;
            }
            else {
                len += 2;
            }
        }
        return len;
    };
    //获取文本宽度
    const getTextWidth = (str, fontSize) => {
        const len = getStrLen(str);
        return (fontSize * len) / 2;
    };
    //获取json中的图片节点
    const getDepImgs = (json) => {
        let doms = json.doms || [];
        return doms.reduce((total, curr) => {
            if (curr.type == 'block' && curr.doms && curr.doms.length > 0) {
                total = [...total, ...getDepImgs(curr)];
            }
            else if (curr.type === 'image') {
                total.push(curr.url);
            }
            return total;
        }, []);
    };

    const rsAstralRange = '\\ud800-\\udfff', rsZWJ = '\\u200d', rsVarRange = '\\ufe0e\\ufe0f', rsComboMarksRange = '\\u0300-\\u036f', reComboHalfMarksRange = '\\ufe20-\\ufe2f', rsComboSymbolsRange = '\\u20d0-\\u20ff', rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
    const rsFitz = '\\ud83c[\\udffb-\\udfff]', rsOptVar = '[' + rsVarRange + ']?', rsCombo = '[' + rsComboRange + ']', rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')', reOptMod = rsModifier + '?', rsAstral = '[' + rsAstralRange + ']', rsNonAstral = '[^' + rsAstralRange + ']', rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}', rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]', rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*', rsSeq = rsOptVar + reOptMod + rsOptJoin, rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';
    const reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + ']');
    const reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');
    function hasUnicode(val) {
        return reHasUnicode.test(val);
    }
    function unicodeToArray(val) {
        return val.match(reUnicode) || [];
    }
    function asciiToArray(val) {
        return val.split('');
    }
    function toArray(val) {
        // 字符串转成数组
        return hasUnicode(val) ? unicodeToArray(val) : asciiToArray(val);
    }

    const { createOffscreenCanvas, getFileSystemManager, showToast } = wx;
    const depImageLoadeds = [];
    class CreateOffScreenCanvas {
        constructor(width = 750, height = 1125, ratio = 2) {
            this.drawReact = (x, y, w, h, style) => {
                this.ctx.fillStyle = style;
                this.ctx.fillRect(x * this.ratio, y * this.ratio, w * this.ratio, h * this.ratio);
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
            this.drawRoundReact = (ox, oy, ow, oh, style = "#000", rounds = [0, 0, 0, 0]) => {
                const ctx = this.ctx;
                let [lt, rt, rb, lb] = [0, 0, 0, 0];
                if (Array.isArray(rounds)) {
                    [lt, rt, rb, lb] = rounds.map((i) => i * this.ratio);
                }
                else {
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
            this.drawLinearGradientReact = (x, y, w, h, dur = "y", start, stop) => {
                let grad;
                if (dur == "y") {
                    grad = this.ctx.createLinearGradient(x * this.ratio, y * this.ratio, x * this.ratio, (y + h) * this.ratio); //创建一个渐变色线性对象
                }
                else {
                    grad = this.ctx.createLinearGradient(x * this.ratio, y * this.ratio, (x + w) * this.ratio, y * this.ratio); //创建一个渐变色线性对象
                }
                grad.addColorStop(0, start); //定义渐变色颜色
                grad.addColorStop(1, stop);
                this.ctx.fillStyle = grad; //设置fillStyle为当前的渐变对象
                this.ctx.fillRect(x * this.ratio, y * this.ratio, w * this.ratio, h * this.ratio);
            };
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
            this.drawText = (txt = "", x, y, style = "#ffffff", bold = "normal", size = 16, align = "left", angle = 0, maxWidth = null, ellipsis = null, verticalAlign = "top") => {
                this.ctx.font = `${bold} ${size * this.ratio}px normal `;
                this.ctx.fillStyle = style;
                this.ctx.textAlign = align;
                if (maxWidth != null) {
                    if (ellipsis) {
                        // 省略号
                        txt = this.getEllipsisText(txt, size, maxWidth, bold);
                    }
                    else {
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
            this.drawStrokeText = (txt = "", x, y, fillColor = "#FFFFFF", strokeColor = "#FFFFFF", size = 16, align = "left", lineWidth = 5, angle = 0) => {
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
            this.drawDiffTexts = (textArr, y, startObj) => {
                let widthList = textArr.map((item) => {
                    this.ctx.font = `${item.weight || "normal"} ${item.size *
                    this.ratio}px normal`;
                    if (item.lineWidth) {
                        return (this.ctx.measureText(item.txt).width + item.lineWidth * 2 * this.ratio);
                    }
                    return this.ctx.measureText(item.txt).width;
                });
                let startP;
                if (startObj) {
                    let x = startObj.x * this.ratio;
                    let w = startObj.w * this.ratio;
                    if (startObj.align == "center") {
                        startP = w / 2 - widthList.reduce((cur, nex) => cur + nex, 0) / 2 + x;
                    }
                    else if (startObj.align == "left") {
                        startP = x;
                    }
                }
                else {
                    // 没有传入其实位置信息 默认画布居中
                    startP =
                        this.width / 2 - widthList.reduce((cur, nex) => cur + nex, 0) / 2;
                }
                textArr.forEach((item, index) => {
                    if (item.lineWidth) {
                        this.drawStrokeText(item.txt, startP / this.ratio, item.y ? item.y : y, item.fillColor, item.strokeColor, item.size, "left", item.lineWidth, item.angle || 0);
                    }
                    else {
                        this.drawText(item.txt, startP / this.ratio, item.y ? item.y : y, item.color, item.weight || "normal", item.size, "left", item.angle || 0);
                    }
                    startP += widthList[index];
                });
            };
            this.loadImage = (url) => __awaiter(this, void 0, void 0, function* () {
                let img = this.canvas.createImage();
                return new Promise((resolve) => {
                    img.onload = () => {
                        resolve({ img, url });
                    };
                    img.src = url;
                });
            });
            this.depImgs = (imgs) => __awaiter(this, void 0, void 0, function* () {
                let res = yield Promise.all(imgs.map((i) => {
                    let fin = [...depImageLoadeds].find((item) => item.url === i);
                    if (fin) {
                        return fin;
                    }
                    return this.loadImage(i);
                }));
                depImageLoadeds.push(...res);
            });
            this.drawImg = (url, x, y, w, h) => __awaiter(this, void 0, void 0, function* () {
                let img = this.canvas.createImage();
                let res = [...depImageLoadeds].find((item) => item.url === url);
                if (res) {
                    img = res.img;
                }
                else {
                    yield new Promise((resolve) => {
                        img.onload = resolve;
                        img.src = url;
                    });
                    let resImage = yield this.loadImage(url);
                    img = resImage.img;
                    depImageLoadeds.push(resImage);
                }
                this.ctx.drawImage(img, x * this.ratio, y * this.ratio, w * this.ratio, h * this.ratio);
            });
            this.drawAvatar = (url, x, y, r, fillStyle = "#ffffff") => __awaiter(this, void 0, void 0, function* () {
                this.ctx.beginPath();
                this.ctx.arc((x + r) * this.ratio, (y + r) * this.ratio, r * this.ratio + 5, 0, 2 * Math.PI, false);
                this.ctx.fillStyle = fillStyle;
                this.ctx.fill();
                this.ctx.save();
                // 头像
                this.ctx.beginPath();
                this.ctx.arc((x + r) * this.ratio, (y + r) * this.ratio, r * this.ratio, 0, 2 * Math.PI, false);
                this.ctx.clip(); //画好了圆 剪切 原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因
                this.ctx.beginPath();
                this.ctx.arc((x + r) * this.ratio, (y + r) * this.ratio, r * this.ratio, 0, 2 * Math.PI, false);
                yield this.drawImg(url, x, y, r * 2, r * 2);
                this.ctx.restore();
            });
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
            this.drawPolygon = (polygon) => __awaiter(this, void 0, void 0, function* () {
                polygon.imgObj && this.ctx.save();
                this.ctx.beginPath();
                for (let [index, point] of polygon.points.entries()) {
                    if (index) {
                        this.ctx.lineTo(point.x * this.ratio, point.y * this.ratio);
                    }
                    else {
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
                    yield this.drawImg(polygon.imgObj.url, polygon.imgObj.x, polygon.imgObj.y, polygon.imgObj.w, polygon.imgObj.h);
                    this.ctx.restore();
                }
                else {
                    this.ctx.fillStyle = polygon.fillStyle;
                    this.ctx.fill();
                }
            });
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
            this.drawRoundImage = (imgSrc, ox, oy, ow, oh, or = 0, angle = 0) => __awaiter(this, void 0, void 0, function* () {
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
                yield this.drawImg(imgSrc, ox, oy, w / this.ratio, h / this.ratio);
                ctx.restore();
            });
            /**
             * 旋转元素
             * @param {number} angle 旋转角度
             * @param {number} x 旋转中心x坐标
             * @param {number} y 旋转中心y坐标
             * @param {number} radio 坐标比例，如果传2，则x、y都会乘以2
             * @returns
             */
            this.rotate = (angle, x = 0, y = 0) => __awaiter(this, void 0, void 0, function* () {
                const ctx = this.ctx;
                ctx.save();
                ctx.translate(x * this.ratio, y * this.ratio);
                ctx.rotate((angle * Math.PI) / 180);
                ctx.translate(-x * this.ratio, -y * this.ratio);
            });
            this.getDataUrl = () => {
                return this.ctx.canvas.toDataURL("image/jpg", 1);
            };
            this.getTempFilePath = (imgSrc, number) => {
                return new Promise((resolve, reject) => {
                    // const number = Math.random();
                    const manger = getFileSystemManager();
                    const filePath = this.filePathPrefix + number + ".png";
                    if (this.fileList.has(filePath)) {
                        resolve(filePath);
                        return;
                    }
                    manger.writeFile({
                        filePath,
                        data: imgSrc.slice(22),
                        encoding: "base64",
                        success: () => {
                            this.fileList.add(filePath);
                            console.log(this.fileList);
                            resolve(filePath);
                        },
                        fail: (err) => {
                            reject(err);
                            showToast({ title: "图片加载失败，请稍后再试~" });
                        },
                    });
                });
            };
            // 清空缓存图片
            this.removeTempFilePath = (url) => {
                try {
                    removeTempFile(url);
                }
                catch (error) { }
                if (url) {
                    return this.fileList.delete(url);
                }
                this.fileList.clear();
            };
            this.width = width * ratio;
            this.height = height * ratio;
            this.ratio = ratio; // 放大比例
            this.fileList = new Set(); // tempFile 文件集合
            this.filePathPrefix = wx.env.USER_DATA_PATH + "/pic"; //存储临时文件的路径前缀
        }
        getContext(id, width, height, ratio, useCanvas = "auto", componentInstance) {
            return __awaiter(this, void 0, void 0, function* () {
                if (ratio)
                    this.ratio = ratio; // 放大比例
                if (width)
                    this.width = width * ratio;
                if (height)
                    this.height = height * ratio;
                this.canvas = createOffscreenCanvas({
                    type: "2d",
                    width: this.width,
                    height: this.height,
                });
                this.ctx = this.canvas.getContext("2d");
                let isCanvasComponent = true;
                if (useCanvas == "auto") {
                    isCanvasComponent =
                        this.canvas.width != this.width || this.canvas.height != this.height;
                }
                else if (useCanvas == "canvas") {
                    isCanvasComponent = true;
                }
                else {
                    isCanvasComponent = false;
                }
                if (isCanvasComponent) {
                    console.log("------------------采用canvas组件-----------------");
                    return new Promise((resolve, reject) => {
                        let query = null;
                        if (componentInstance) {
                            query = wx.createSelectorQuery().in(componentInstance);
                        }
                        else {
                            query = wx.createSelectorQuery();
                        }
                        query
                            .select(id)
                            .fields({
                            node: true,
                            size: true,
                        })
                            .exec((res) => {
                            const canvas = res[0].node;
                            canvas.width = this.width;
                            canvas.height = this.height;
                            this.canvas = canvas;
                            console.log(this.canvas);
                            this.ctx = this.canvas.getContext("2d");
                            resolve(this);
                        });
                    });
                }
                else {
                    console.log("------------------采用离屏渲染-----------------");
                    return this;
                }
            });
        }
        //获取超出省略的文字
        getEllipsisText(text, fontSize, maxWidth, fontWeight = "normal") {
            let textUnicodeArray = toArray(text) || text; //防止emoji表情被折断
            let relTxt = []; //防止slice的时候emoji被截断
            for (let n = 0; n < textUnicodeArray.length; n++) {
                if (this.getTextWidth(relTxt.join(""), fontSize, fontWeight) <
                    maxWidth * this.ratio) {
                    relTxt.push(textUnicodeArray[n]);
                }
                else {
                    relTxt.splice(relTxt.length - 1, 1, "...");
                    return relTxt.join("");
                }
            }
            return relTxt.join("");
        }
        //获取折行的文本
        getBreakWords(text, fontSize, maxWidth, fontWeight = "normal") {
            let textUnicodeArray = toArray(text) || text; //防止emoji表情被折断
            let arr = [];
            let relTxt = "";
            for (let n = 0; n < textUnicodeArray.length; n++) {
                relTxt += textUnicodeArray[n];
                if (this.getTextWidth(relTxt, fontSize, fontWeight) >=
                    maxWidth * this.ratio) {
                    arr.push(relTxt);
                    relTxt = "";
                }
            }
            relTxt && arr.push(relTxt);
            return arr;
        }
        /**
         * 获取文字的大小
         * @param {string} str 要测试的字符串
         * @param {number} fontSize 字符串的字体大小
         * @returns {number} 测量字符串的长度
         */
        getTextWidth(str, fontSize, fontWeight = "normal") {
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
        getTextsWidthTotal(texts) {
            return texts.reduce((total, cur) => {
                return total + this.getTextWidth(cur.txt, cur.size);
            }, 0);
        }
        havePoint(val) {
            return val.indexOf(".") >= 0;
        }
    }
    const ins = new CreateOffScreenCanvas();

    var createPoster = {
        //创建图片
        createImages(dom, config, ins) {
            return __awaiter(this, void 0, void 0, function* () {
                let { url, x = 0, y = 0, width = 0, height = 0, rotate = 0, borderRadius = [], clip, borderWidth = 0, borderColor = 0, beforeText, } = dom;
                let radius = borderRadius[0] || 0;
                if (beforeText) {
                    const { value, fontSize, fontWeight, width: maxWidth } = beforeText;
                    let ellipsText = ins.getEllipsisText(value, fontSize, maxWidth, fontWeight);
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
                    yield ins.drawPolygon(polygon);
                }
                else {
                    yield ins.drawRoundImage(url, x * ins.ratio, y * ins.ratio, width * ins.ratio, height * ins.ratio, radius * ins.ratio, rotate);
                }
                ins.ctx.restore();
            });
        },
        //创建文本
        createText(dom, config, ins) {
            return __awaiter(this, void 0, void 0, function* () {
                let { value, x, y, width = config.width, color = "#000", fontWeight, fontSize, textAlign, rotate = 0, lineNum, } = dom;
                let [relX, relY, relWidth, relFontSize] = [
                    x * ins.ratio,
                    y * ins.ratio,
                    width * ins.ratio,
                    fontSize * ins.ratio,
                ];
                if (textAlign === "center") {
                    relX = relX + relWidth / 2;
                }
                else if (textAlign === "right") {
                    relX = relX + relWidth;
                }
                yield ins.drawText(value + "", relX, relY + relFontSize, color, fontWeight, relFontSize, textAlign, rotate, relWidth, lineNum);
            });
        },
        //创建多规格文本
        createTexts(dom, config, ins) {
            return __awaiter(this, void 0, void 0, function* () {
                let textArr = dom.texts.map((text) => {
                    return {
                        txt: text.value,
                        size: text.fontSize * ins.ratio,
                        color: text.color,
                        weight: text.fontWeight,
                    };
                });
                const domY = dom.y + dom.texts.sort((a, b) => b.fontSize - a.fontSize)[0].fontSize;
                yield ins.drawDiffTexts(textArr, domY * ins.ratio, {
                    x: dom.x * ins.ratio,
                    w: dom.width * ins.ratio,
                    align: dom.textAlign,
                });
            });
        },
        //创建dom块
        createBlock(dom, config, ins) {
            return __awaiter(this, void 0, void 0, function* () {
                const { rotate, rotateOrigin = [0, 0], translate = [0, 0] } = dom;
                ins.ctx.save();
                if (rotate) {
                    const [originX, originY] = rotateOrigin;
                    ins.rotate(dom.rotate, originX * ins.ratio, originY * ins.ratio);
                }
                ins.ctx.translate(...translate.map((i) => i * ins.ratio));
                yield this.handlerDoms(dom.doms, config, ins);
                ins.ctx.restore();
            });
        },
        //创建矩形
        createRect(dom, config, ins) {
            return __awaiter(this, void 0, void 0, function* () {
                const { x = 0, y = 0, width = config.width * config.ratio, height = config.height * config.ratio, bgColor = "#fff", borderRadius = 0, } = dom;
                ins.drawRoundReact(x, y, width, height, bgColor, borderRadius);
            });
        },
        sortDoms(doms = []) {
            return doms
                .map((dom) => {
                var _a;
                dom.zIndex = dom.zIndex || 0;
                if ((_a = dom.doms) === null || _a === void 0 ? void 0 : _a.length) {
                    dom.doms = this.sortDoms(dom.doms);
                }
                return dom;
            })
                .sort((a, b) => a.zIndex - b.zIndex);
        },
        handlerDoms(doms, config, ins) {
            return __awaiter(this, void 0, void 0, function* () {
                doms = this.sortDoms(doms);
                //并行加载所有图片
                yield ins.depImgs(doms.filter((d) => d.type === "image").map((d) => d.url));
                for (let [, dom] of doms.entries()) {
                    switch (dom.type) {
                        case "rect":
                            yield this.createRect(dom, config, ins);
                            break;
                        case "image":
                            yield this.createImages(dom, config, ins);
                            break;
                        case "text":
                            yield this.createText(dom, config, ins);
                            break;
                        case "texts":
                            yield this.createTexts(dom, config, ins);
                            break;
                        case "block":
                            yield this.createBlock(dom, config, ins);
                            break;
                    }
                }
            });
        },
        draw(config, depImgs = []) {
            return __awaiter(this, void 0, void 0, function* () {
                config = deepClone(config);
                let { width, height, ratio = 1, posterFileName = "canvas-poster", doms = [], } = config;
                let [relWidth, relHeight] = [width * ratio, height * ratio];
                yield ins.getContext("#posterCanvas", relWidth, relHeight, ratio, config.useCanvas || "auto", config.componentInstance);
                yield ins.depImgs(depImgs);
                ins.ctx.clearRect(0, 0, relWidth, relHeight);
                //创建背景
                if (config.bgColor) {
                    this.createRect({
                        bgColor: config.bgColor,
                    }, config, ins);
                }
                yield this.handlerDoms(doms, config, ins);
                //获取图片本地链接
                function getTempFilePath() {
                    return __awaiter(this, void 0, void 0, function* () {
                        let imgSrc = ins.getDataUrl();
                        let tempFilePath = yield ins.getTempFilePath(imgSrc, posterFileName);
                        return tempFilePath;
                    });
                }
                return { ins, getTempFilePath };
            });
        },
    };

    var createHtml = {
        domResultList: [],
        parseStyle(obj) {
            let arr = [];
            for (let i in obj) {
                arr.push(i + ":" + obj[i]);
            }
            return arr.join(";");
        },
        drawSingleText(v, ratio, config) {
            let obj = {};
            obj.tag = "text";
            obj.value = v.value;
            const { x = 0, y = 0, width = config.width, fontSize, fontFamily, fontWeight = "normal", color = "#000", textAlign = "left", borderWidth = 0, rotate = 0, lineNum = 1, borderColor = "#000", zIndex = 1, } = v;
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
                "-webkit-line-clamp": lineNum,
                zIndex,
            };
            obj.styleStr = this.parseStyle(obj.style);
            return obj;
        },
        drawMultiText(v, ratio, config) {
            const { x = 0, y = 0, width = config.width, textAlign = "left", texts = [], zIndex = 1, } = v;
            let obj = {
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
            obj.doms = texts.map((item) => {
                let dom = {
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
            return obj;
        },
        drawImage(v, ratio, config) {
            let { url, x = 0, y = 0, width = config.width, height = config.height, borderWidth = 0, borderColor = "#000", rotate = 0, borderRadius = [], zIndex = 1, beforeText, } = v;
            if (beforeText) {
                const { value, fontSize, width: maxWidth } = beforeText;
                let textWidth = getTextWidth(value, fontSize);
                if (textWidth > maxWidth) {
                    x = x + maxWidth;
                }
                else {
                    x = x + textWidth;
                }
            }
            let rectObj = null;
            let obj = {};
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
                "border-radius": borderRadius.reduce((tol, cur) => tol + (cur + "rpx "), ""),
                zIndex,
            };
            if (v.hasOwnProperty("clip")) {
                delete obj.style["border-radius"];
                let polygon = v.clip.map((v) => {
                    let formatV = [`${(v[0] - x) * ratio}rpx`, `${(v[1] - y) * ratio}rpx`];
                    return formatV
                        .join()
                        .split(",")
                        .join(" ")
                        .toString();
                });
                obj.style["clip-path"] = `polygon(${polygon})`;
                //绘制多边形边框
                if (borderWidth) {
                    v.width += borderWidth * 2;
                    v.height += borderWidth * 2;
                    v.clip.forEach((p) => {
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
            }
            else {
                return obj;
            }
        },
        drawRect(v, ratio, config) {
            const { borderRadius = [], x = 0, y = 0, width = config.width, height = config.height, borderWidth = 0, borderColor = "none", bgColor = "#fff", rotate = 0, zIndex, } = v;
            let obj = {};
            obj.tag = "view";
            obj.style = {
                position: "absolute",
                left: `${x * ratio}rpx`,
                top: `${y * ratio}rpx`,
                width: `${width * ratio}rpx`,
                height: `${height * ratio}rpx`,
                "text-shadow": `0 0 ${borderWidth * ratio}rpx ${borderColor}`,
                transform: `rotate(${rotate}deg)`,
                "border-radius": borderRadius.reduce((tol, cur) => tol + (cur + "rpx "), ""),
                background: bgColor,
                zIndex,
            };
            if (v.hasOwnProperty("clip")) {
                delete obj.style["border-radius"];
                let polygon = v.clip.map((v) => {
                    let formatV = [`${(v[0] - x) * ratio}rpx`, `${(v[1] - y) * ratio}rpx`];
                    return formatV
                        .join()
                        .split(",")
                        .join(" ")
                        .toString();
                });
                obj.style["clip-path"] = `polygon(${polygon})`;
            }
            obj.styleStr = this.parseStyle(obj.style);
            return obj;
        },
        drawBlock(v, ratio, config) {
            const { x = 0, y = 0, width = config.width, height = config.height, borderWidth = 0, borderColor = "#000", rotate = 0, borderRadius = [], doms = [], zIndex = 1, } = v;
            const vDoms = doms.map((item) => {
                item.x = item.x - x;
                item.y = item.y - y;
                return item;
            });
            let obj = {
                tag: "block",
                style: {
                    position: "absolute",
                    left: `${x * ratio}rpx`,
                    top: `${y * ratio}rpx`,
                    width: `${width * ratio}rpx`,
                    height: `${height * ratio}rpx`,
                    "text-shadow": `0 0 ${borderWidth * ratio}rpx ${borderColor}`,
                    transform: `rotate(${rotate}deg)`,
                    "border-radius": borderRadius.reduce((tol, cur) => tol + (cur + "rpx "), ""),
                    transformOrigin: "center center",
                    zIndex,
                },
            };
            obj.doms = this.handleDoms(vDoms, config, false);
            obj.styleStr = this.parseStyle(obj.style);
            return obj;
        },
        handleDoms(doms, config, pushRoot = true) {
            let domResultList = [];
            const { displayWidth, width } = config;
            let ratio = displayWidth / width;
            doms === null || doms === void 0 ? void 0 : doms.forEach((v) => {
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
        sortDoms(doms = []) {
            return doms
                .map((dom) => {
                var _a;
                dom.zIndex = dom.zIndex || 0;
                if ((_a = dom.doms) === null || _a === void 0 ? void 0 : _a.length) {
                    dom.doms = this.sortDoms(dom.doms);
                }
                return dom;
            })
                .sort((a, b) => a.zIndex - b.zIndex);
        },
        parseJson(config = {}) {
            config = deepClone(config);
            this.domResultList = [];
            const { doms, displayWidth, width } = config;
            if (config.bgColor) {
                this.domResultList.push(this.drawRect({
                    bgColor: config.bgColor,
                }, displayWidth / width, config));
            }
            this.handleDoms(this.sortDoms(doms), config);
            return this.domResultList;
        },
    };

    function getPoster(json) {
        return __awaiter(this, void 0, void 0, function* () {
            let depImgs = getDepImgs(json);
            let poster = yield createPoster.draw(json, depImgs);
            let img = yield poster.getTempFilePath();
            return Object.assign(Object.assign({}, poster), { img });
        });
    }
    function getPreview(json) {
        return createHtml.parseJson(json);
    }

    exports.getPoster = getPoster;
    exports.getPreview = getPreview;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
