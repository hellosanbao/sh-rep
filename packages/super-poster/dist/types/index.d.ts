import { PosterOptions } from "./types";
export declare function getPoster(json: PosterOptions): Promise<{
    img: unknown;
    ins: import("./utils/canvas").default;
    getTempFilePath: () => Promise<unknown>;
}>;
export declare function getPreview(json: PosterOptions): any;
