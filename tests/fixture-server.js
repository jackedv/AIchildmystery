// Explicit development-only server. Production never imports this module.
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {createGameServer} from "../server/http.js";
import {SCORE_DIMENSIONS} from "../src/scoring.js";
const root=fileURLToPath(new URL("../",import.meta.url));
const image="data:image/jpeg;base64,"+(await readFile(new URL("../assets/level-1/scene.jpg",import.meta.url))).toString("base64");
const server=await createGameServer({root,config:{key:""},journal:false,evaluate:async(body,signal)=>{
  if(body.text.includes("等待")) await new Promise(resolve=>{const timer=setTimeout(resolve,30000);signal.addEventListener("abort",()=>{clearTimeout(timer);resolve();},{once:true});});
  if(body.text.includes("追问")) return {status:"clarify",question:"界面测试：你想让公主使用哪个物体？"};
  if(body.text.includes("异常"))return {status:"system_error",message:"画面生成失败了，但你的方案已经被记录。请重新提交一次。"};
  return {status:body.text.includes("失败")?"failure":"success",image,understanding:"这是开发用测试响应。",change:"这张占位画面仅用于检查结果界面。",reason:"不代表真实 AI 判断或生成结果。",scores:SCORE_DIMENSIONS.map((d,i)=>({dimension:d.id,score:[8,7,9,6,8][i],reason:"界面测试用评分，真实分数由模型生成。"}))};
}});
server.listen(4180,"127.0.0.1",()=>console.log("独立界面测试 http://127.0.0.1:4180/"));
