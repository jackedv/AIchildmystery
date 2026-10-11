import { readFile } from "node:fs/promises";
import path from "node:path";
import { getLevel } from "../src/level.js";
import { renderScene } from "./scene-renderer.js";
import { SCORE_DIMENSIONS, validScores, orderedScores } from "../src/scoring.js";

const BASE = "https://ark.cn-beijing.volces.com/api/v3";
export const DEFAULT_MODELS = { text: "doubao-seed-2-1-pro-260915", image: "doubao-seedream-5-0-flash-260915" };
export class AiError extends Error {
  constructor(kind) { super(kind); this.kind=kind; }
}
const stringField = {type:"string"};
const schema = properties => ({type:"object",properties,required:Object.keys(properties),additionalProperties:false});
const judgmentSchema = LEVEL => schema({
  status:{type:"string",enum:["success","failure","clarify"]},
  normalized:stringField, understanding:stringField,
  objectIds:{type:"array",items:{type:"string",enum:LEVEL.objects.map(o=>o.id)}},
  actions:{type:"array",items:stringField},
  confidence:{type:"number"}, reason:stringField, question:stringField, changes:stringField,
  checks:schema(Object.fromEntries(["clarity","constraints","physics","goal"].map(k=>[k,{type:"string",enum:["pass","fail","unclear","not_evaluated"]}]))),
  scores:{type:"array",items:schema({dimension:{type:"string",enum:SCORE_DIMENSIONS.map(d=>d.id)},score:{type:"integer",minimum:0,maximum:10},reason:{type:"string",maxLength:35}})}
});
const narrationSchema = LEVEL => schema({ consistent:{type:"boolean"}, princessLocation:{type:"string",enum:LEVEL.locations}, constraintsRespected:{type:"boolean"},
  identityPreserved:{type:"boolean"},objectScalePreserved:{type:"boolean"},backgroundPreserved:{type:"boolean"},causalStructureMatches:{type:"boolean"},
  understanding:stringField, change:stringField, reason:stringField });
export async function loadConfig(root) {
  let text="";
  try { text=await readFile(path.join(root,".env"),"utf8"); } catch(error) { if(error.code!=="ENOENT") throw error; }
  const values={};
  for(const line of text.split(/\r?\n/)) {
    const match=line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if(match) values[match[1]]=match[2].replace(/^["']|["']$/g,"");
  }
  return { key:process.env.ARK_API_KEY || values.ARK_API_KEY || "",
    textModel:values.ARK_TEXT_MODEL || DEFAULT_MODELS.text,
    imageModel:values.ARK_IMAGE_MODEL || DEFAULT_MODELS.image };
}
export function validateAttempt(body) {
  const level=getLevel(body?.levelId);
  if(!level || typeof body.text!=="string") throw new AiError("invalid");
  const text=body.text.trim(), size=Array.from(text).length;
  if(size<3 || size>80) throw new AiError("invalid");
  const context=body.context ?? [];
  if(!Array.isArray(context) || context.length>5 || context.some(c=>!c || typeof c.text!=="string" || typeof c.question!=="string" || c.text.length>160 || c.question.length>200)) throw new AiError("invalid");
  return {level,text,context:context.map(c=>({text:c.text,question:c.question}))};
}
function validateJudgment(value,LEVEL) {
  if(!value || !["success","failure","clarify"].includes(value.status) || !Array.isArray(value.objectIds) ||
    value.objectIds.some(id=>!LEVEL.objects.some(o=>o.id===id)) || !Array.isArray(value.actions) ||
    value.actions.some(a=>typeof a!=="string") || !Number.isFinite(value.confidence) || value.confidence<0 || value.confidence>1 ||
    ["normalized","understanding","reason","question","changes"].some(k=>typeof value[k]!=="string" || value[k].length>1000)) throw new AiError("format");
  if(value.status==="clarify" && !value.question.trim()) throw new AiError("format");
  if(value.status!=="clarify" && (!value.reason.trim() || !value.changes.trim())) throw new AiError("format");
  const checks=["clarity","constraints","physics","goal"].map(k=>value.checks?.[k]);
  if(checks.some(c=>!["pass","fail","unclear","not_evaluated"].includes(c))) throw new AiError("format");
  const stop=checks.findIndex(c=>c!=="pass");
  if(stop>=0 && (checks[stop]==="not_evaluated" || checks.slice(stop+1).some(c=>c!=="not_evaluated"))) throw new AiError("format");
  if(value.status==="success" && (stop!==-1 || !validScores(value.scores))) throw new AiError("format");
  if(value.status!=="success" && (!Array.isArray(value.scores) || value.scores.length || stop===-1)) throw new AiError("format");
  if(value.status==="failure" && checks[stop]!=="fail") throw new AiError("format");
  if(value.status==="clarify" && checks[stop]!=="unclear" && !(stop===1 && checks[stop]==="fail")) throw new AiError("format");
  return value;
}
export function createEvaluator({root,config,transport=fetch}) {
  async function prompt(name) { return readFile(path.join(root,"prompts",name+".md"),"utf8"); }
  async function imageData(file) {
    const data=await readFile(path.join(root,file));
    return "data:image/"+(file.endsWith(".jpg")?"jpeg":"png")+";base64,"+data.toString("base64");
  }
  async function remote(route,body,signal) {
    let response;
    try { response=await transport(BASE+route,{method:"POST",headers:{"Authorization":"Bearer "+config.key,"Content-Type":"application/json"},body:JSON.stringify(body),signal}); }
    catch(error) { if(signal.aborted) throw new AiError("timeout"); throw new AiError("network"); }
    if(!response.ok) throw new AiError(response.status===401||response.status===403?"auth":response.status===429?"quota":"upstream");
    try { return await response.json(); } catch { throw new AiError("format"); }
  }
  async function structured(system,content,outputSchema,signal) {
    const result=await remote("/chat/completions",{
      model:config.textModel, messages:[{role:"system",content:system},{role:"user",content}],
      thinking:{type:"disabled"}, max_tokens:1800,
      response_format:{type:"json_schema",json_schema:{name:"game_result",strict:true,schema:outputSchema}}
    },signal);
    try { return JSON.parse(result.choices[0].message.content); } catch { throw new AiError("format"); }
  }
  return async function evaluate(body,signal) {
    const {level:LEVEL,text,context}=validateAttempt(body);
    if(!config.key) return {status:"unavailable",message:"你的想法已经写好了。AI 尚未接入，请先由大人完成本地配置，再来试一试。"};
    if(context.length>=5) return {status:"system_error",message:"已经追问五次了。请重新描述一个完整的方案。"};
    const facts={goal:LEVEL.goal,constraints:LEVEL.constraints,objects:LEVEL.objects.map(({id,name,fact})=>({id,name,fact})),
      layout:LEVEL.layout,successLocation:LEVEL.successLocation,successPosition:LEVEL.successPosition,
      characterPolicy:"初始和未成功公主使用挑战素材；成功使用站立素材。角色姿态有意改变，两者是同一个公主。人物由本地原素材合成，不由生图模型重画。"};
    const original=await imageData(LEVEL.scene);
    const understandingPrompt=await prompt("understand"), judgingPrompt=await prompt("judge");
    const levelFacts=await prompt(LEVEL.promptFolder+"/facts");
    const judgment=validateJudgment(await structured(understandingPrompt+"\n\n"+judgingPrompt+"\n\n"+levelFacts,
      [{type:"text",text:JSON.stringify({sceneFacts:facts,playerInput:text,clarificationContext:context})},{type:"image_url",image_url:{url:original}}],
      judgmentSchema(LEVEL),signal),LEVEL);
    if(judgment.status==="clarify") return {status:"clarify",question:judgment.question};
    const editPrompt=await prompt("scene-edit");
    const images=[await imageData(LEVEL.background)];
    const referenceRoles=["图1：无公主的原始背景，决定构图、物体数量和初始位置。请勿把公主画进背景，本地程序会叠加指定公主素材。"];
    const seen=new Set();
    // Cover each involved object before adding further variants of the stones.
    const ids=[...new Set(["princess",...judgment.objectIds])];
    const references=[...ids.flatMap(id=>(LEVEL.references[id] || []).slice(0,1).map(file=>({id,file}))),
      ...ids.flatMap(id=>(LEVEL.references[id] || []).slice(1).map(file=>({id,file})))];
    for(const {id,file} of references) {
      if(seen.has(file) || images.length>=10) continue;
      seen.add(file);images.push(await imageData(file));
      referenceRoles.push("图"+images.length+"："+LEVEL.objects.find(o=>o.id===id).name+"的本地外观参考（"+path.basename(file)+"），不是新增物体，不决定摆放位置。");
    }
    const finalFrame={outcome:judgment.status,completedPlan:judgment.normalized,involvedObjects:judgment.objectIds,finalScene:judgment.changes,
      princessFinalPosition:judgment.status==="success"?LEVEL.successPosition:"保持初始安全位置",
      characterRendering:"不要绘制公主。只编辑背景里的相关物品；公主将由本地程序叠加。"};
    let correction="";
    for(let renderAttempt=0;renderAttempt<2;renderAttempt++) {
    let edited;
    try {
      edited=await remote("/images/generations",{model:config.imageModel,
        prompt:editPrompt+"\n"+levelFacts+"\n参考图片对应关系：\n"+referenceRoles.join("\n")+"\n已确认的场景事实："+JSON.stringify(facts)+"\n只绘制这个最终定格："+JSON.stringify(finalFrame)+correction,
        image:images.length===1?images[0]:images,size:"1672x941",output_format:"png",response_format:"b64_json",watermark:true},signal);
    } catch(error) { if(error.kind==="timeout" || error.kind==="auth" || error.kind==="quota") throw error; throw new AiError("image"); }
    const encoded=edited?.data?.[0]?.b64_json;
    if(typeof encoded!=="string" || encoded.length>28_000_000 || !/^[A-Za-z0-9+/=]+$/.test(encoded)) throw new AiError("image");
    const bytes=Buffer.from(encoded,"base64");
    if(bytes.length<8 || bytes.readUInt32BE(0)!==0x89504e47) throw new AiError("image");
    let rendered;
    try {rendered=await renderScene(root,LEVEL,judgment.status,bytes);} catch {throw new AiError("image");}
    const image="data:image/png;base64,"+rendered.toString("base64");
    const narration=await structured(await prompt("explain")+"\n"+levelFacts,
      [{type:"text",text:JSON.stringify({facts,judgment,referenceRoles:["图1：含挑战公主的完整初始场景，其余中间图是本地外观参考，最后一图是合成后的结果。",...referenceRoles.slice(1)]})},{type:"image_url",image_url:{url:original}},...images.slice(1).map(url=>({type:"image_url",image_url:{url}})),{type:"image_url",image_url:{url:image}}],
      narrationSchema(LEVEL),signal);
    if(["understanding","change","reason"].some(k=>typeof narration[k]!=="string" || !narration[k].trim() || narration[k].length>300)) throw new AiError("format");
    const validLocation=LEVEL.locations.includes(narration.princessLocation);
    if(!validLocation || ["consistent","identityPreserved","objectScalePreserved","backgroundPreserved","causalStructureMatches","constraintsRespected"].some(k=>typeof narration[k]!=="boolean")) throw new AiError("format");
    const matchesGoal=judgment.status==="success"?narration.princessLocation===LEVEL.successLocation:narration.princessLocation!==LEVEL.successLocation;
    if(!narration.consistent || !narration.identityPreserved || !narration.objectScalePreserved || !narration.backgroundPreserved || !narration.causalStructureMatches || !narration.constraintsRespected || !matchesGoal) {
      if(renderAttempt===0) {
        correction="\n上一轮图像没有通过核对，观察到的不符点："+JSON.stringify({change:narration.change,reason:narration.reason,princessLocation:narration.princessLocation})+
          "。请重新从原图编辑，纠正这些不符点，保持确认的方案。不要绘制公主，成功公主由本地合成在："+LEVEL.successPosition+"。";
        continue;
      }
      throw new AiError("image");
    }
    return {status:judgment.status,image,understanding:narration.understanding,change:narration.change,reason:narration.reason,
      ...(judgment.status==="success"?{scores:orderedScores(judgment.scores)}:{})};
    }
  };
}
export function errorResult(error) {
  const messages={
    timeout:"思考时间有点长，请稍后重试。",
    auth:"AI 的钥匙还没配置好，请让大人检查 API Key 和模型是否已开通。",
    quota:"AI 暂时忙不过来，请稍后再试；也可以请大人检查可用额度。",
    image:"画面生成失败了，但你的方案已经被记录。请重新提交一次。",
    invalid:"请用 3–80 个字描述这一关的方案。",
    format:"AI 的回答没有整理好。你的想法还在，请再试一次。"
  };
  return {status:"system_error",message:messages[error.kind] || "暂时没能连接 AI。你的想法还在，请稍后重试。"};
}
