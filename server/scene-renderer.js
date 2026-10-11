import sharp from "sharp";
import path from "node:path";
import { CHARACTERS } from "../src/level.js";

// Render the supplied sprite locally. The image model changes scenery, never redraws the princess.
export async function renderScene(root,level,status,background=path.join(root,level.background)) {
  const source=sharp(background),metadata=await source.metadata();
  const [width,height]=level.size;
  if(!metadata.width || !metadata.height || Math.abs(metadata.width/metadata.height-width/height)>.03) throw new Error("scene_ratio");
  const [left,top,w,h]=status==="success"?level.successPlacement:level.challengePlacement;
  const character=status==="success"?CHARACTERS.success:CHARACTERS.challenge;
  const sprite=await sharp(path.join(root,character)).resize(w,h,{fit:"contain",background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
  return source.resize(width,height,{fit:"fill"}).composite([{input:sprite,left,top}]).png().toBuffer();
}
