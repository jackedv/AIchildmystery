import {writeFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import path from "node:path";
import {LEVELS} from "../src/level.js";
import {renderInitialScene} from "../server/scene-renderer.js";
const root=fileURLToPath(new URL("../",import.meta.url));
for(const level of LEVELS) {
  await writeFile(path.join(root,level.scene),await renderInitialScene(root,level));
  console.log("已准备初始场景："+level.title);
}
