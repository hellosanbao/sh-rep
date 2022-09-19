import { PosterOptions, PosImage, Doms, PosText, PosTextGroup, PosBlock } from "../types";
declare const _default: {
    createImages(dom: PosImage, config: PosterOptions, ins: any): Promise<void>;
    createText(dom: PosText, config: PosterOptions, ins: any): Promise<void>;
    createTexts(dom: PosTextGroup, config: PosterOptions, ins: any): Promise<void>;
    createBlock(dom: PosBlock, config: PosterOptions, ins: any): Promise<void>;
    handlerDoms(doms: Doms, config: PosterOptions, ins: any): Promise<void>;
    draw(config: PosterOptions, depImgs?: any[]): Promise<{
        ins: import("../utils/canvas").default;
        getTempFilePath: () => Promise<unknown>;
    }>;
};
export default _default;