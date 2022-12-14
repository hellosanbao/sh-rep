export interface Base {
    /** x坐标 */
    x: number;
    /**y坐标 */
    y: number;
    /** 文本宽度*/
    width?: number;
    /** 层级*/
    zIndex: number;
}
export interface TextDom {
    /**文本内容 */
    value: string;
    /** 字体大小 */
    fontSize: 48;
    /**文本颜色 */
    color: "#000";
    /**字重 */
    fontWeight: "bold";
    /**宽度 */
    width?: number;
}
export interface PosText extends Base, TextDom {
    /** 类型 */
    type: "text";
    /** 行数*/
    lineNum: number;
    /**左右对其方式 */
    textAlign: "left" | "center" | "right";
    /**文字描边颜色 */
    borderColor: string;
    /**文字描边宽度 */
    borderWidth: number;
    /**旋转角度 */
    rotate: number;
}
export interface PosTextGroup extends Base {
    /**类型 */
    type: "texts";
    /** x坐标 */
    x: number;
    /**y坐标 */
    y: number;
    /** 文本宽度*/
    width: number;
    /**左右对其方式 */
    textAlign: "left" | "center" | "right";
    texts: Array<TextDom>;
}
export interface PosImage extends Base {
    /**类型 */
    type: "image";
    /**图片链接 */
    url: string;
    /**高度 */
    height: number;
    /** 边框宽度 */
    borderWidth: number;
    /**边框颜色 */
    borderColor: string;
    /**圆角半径 */
    borderRadius: number | any[];
    /**旋转角度 */
    rotate: number;
    /**图片裁剪顶点集合 */
    clip: Array<[number, number]>;
    beforeText: TextDom;
}
export interface PosBlock extends Base {
    type: "block";
    /**高度 */
    height: number;
    /**旋转角度 */
    rotate: number;
    /**旋转中心点 */
    rotateOrigin: [number, number];
    /**偏移（x,y） */
    translate: [number, number];
    doms: Doms;
}
export interface PosRect extends Base {
    type: "rect";
    /**背景色 */
    bgColor: String;
    /**圆角 */
    borderRadius: Array<number> | number;
    /**高度 */
    height?: number;
}
export declare type Dom = PosText | PosImage | PosTextGroup | PosBlock | PosRect;
export declare type Doms = Array<PosText | PosImage | PosTextGroup | PosBlock | PosRect>;
export interface PosterOptions {
    /**画布宽度 */
    width: number;
    /**画布高度 */
    height: number;
    /**展示宽度 */
    displayWidth: number;
    /** 画笔缩放比*/
    ratio: number;
    /**生成海报文件名 */
    posterFileName: string | number;
    /**背景色 */
    bgColor: String;
    /**渲染模式 */
    useCanvas: "auto" | "canvas" | "offscreenCanvas";
    /**若在组件中调用，则需要传入组件实例 */
    componentInstance: any;
    doms: Doms;
}
export declare function getPoster(options: PosterOptions): {
    ins: any;
    getTempFilePath: () => Promise<string>;
    img: string;
};
export interface DomNode {
    tag: "image" | "text" | "texts" | "view" | "block" | "rect";
    src?: string;
    styleStr: string;
    value?: string;
    dom?: {
        value: string;
        styleStr: string;
    };
    doms?: DomNode[];
}
export declare function getPreview(options: PosterOptions): Array<DomNode>;
