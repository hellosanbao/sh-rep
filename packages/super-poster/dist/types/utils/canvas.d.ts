export default class CreateOffScreenCanvas {
    width: number;
    height: number;
    ratio: number;
    fileList: Set<string>;
    filePathPrefix: string;
    canvas: any;
    ctx: any;
    constructor(width?: number, height?: number, ratio?: number);
    getContext(id: string, width: number, height: number, ratio: number, useCanvas: string, componentInstance: any): Promise<unknown>;
    drawReact: (x: number, y: number, w: number, h: number, style: string) => void;
    /**
     * 绘制圆角矩形
     * @param {number} x 圆角矩形左上角的x坐标
     * @param {number} y 圆角矩形左上角的y坐标
     * @param {number} w 圆角矩形的宽度
     * @param {number} h 圆角矩形的高度
     * @param {string} style 圆角矩形的填充样式
     * @param {[]number | number} rounds 圆角矩形的圆角大小 [topLeft, topRight, bottomRight, bottomLeft]
     */
    drawRoundReact: (ox: number, oy: number, ow: number, oh: number, style?: string, rounds?: number[]) => void;
    drawLinearGradientReact: (x: number, y: number, w: number, h: number, dur: string, start: number, stop: number) => void;
    getEllipsisText(text: string, fontSize: number, maxWidth: number, fontWeight?: string): string;
    getBreakWords(text: string, fontSize: number, maxWidth: number, fontWeight?: string): any[];
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
    drawText: (txt: string, x: number, y: number, style?: string, bold?: string, size?: number, align?: string, angle?: number, maxWidth?: any, ellipsis?: any, verticalAlign?: string) => void;
    drawStrokeText: (txt: string, x: number, y: number, fillColor?: string, strokeColor?: string, size?: number, align?: string, lineWidth?: number, angle?: number) => void;
    /**
     * 绘制不同大小的文字
     * @param {[ { txt:string,size:number,color:string,weight:string,angle?:number,lineWidth?:number,fillColor?:string,strokeColor?:string} ]} textArr 文字列表
     * @param {number} y
     * @param {{x:number,w:number,align:'center'|'left'}} startObj? 起始位置信息
     */
    drawDiffTexts: (textArr: any[], y: number, startObj: any) => void;
    loadImage: (url: string) => Promise<unknown>;
    depImgs: (imgs: any[]) => Promise<void>;
    drawImg: (url: string, x: number, y: number, w: number, h: number) => Promise<void>;
    drawAvatar: (url: string, x: number, y: number, r: number, fillStyle?: string) => Promise<void>;
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
    drawPolygon: (polygon: any) => Promise<void>;
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
    drawRoundImage: (imgSrc: string, ox: number, oy: number, ow: number, oh: number, or?: number, angle?: number) => Promise<void>;
    /**
     * 旋转元素
     * @param {number} angle 旋转角度
     * @param {number} x 旋转中心x坐标
     * @param {number} y 旋转中心y坐标
     * @param {number} radio 坐标比例，如果传2，则x、y都会乘以2
     * @returns
     */
    rotate: (angle: number, x?: number, y?: number) => Promise<void>;
    /**
     * 获取文字的大小
     * @param {string} str 要测试的字符串
     * @param {number} fontSize 字符串的字体大小
     * @returns {number} 测量字符串的长度
     */
    getTextWidth(str: string, fontSize: number, fontWeight?: string): any;
    /**
     * 获取文字集合的总长度
     * @param { {txt:string; size:number}[] } texts 文字集合
     */
    getTextsWidthTotal(texts: any): any;
    havePoint(val: any): boolean;
    getDataUrl: () => any;
    getTempFilePath: (imgSrc: string, number: number | string) => Promise<unknown>;
    removeTempFilePath: (url: string) => boolean;
}
export declare const ins: CreateOffScreenCanvas;
