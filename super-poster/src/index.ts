import createPoster from "./core/creatPoster";
import createHtml from "./core/createHtml";
import { getDepImgs } from "./utils/utils";

import { PosterOptions } from "./types";

export async function getPoster(json: PosterOptions) {
  let depImgs = getDepImgs(json);
  let poster = await createPoster.draw(json, depImgs);
  let img = await poster.getTempFilePath();
  return {
    ...poster,
    img,
  };
}
export function getPreview(json: PosterOptions) {
  return createHtml.parseJson(json);
}
