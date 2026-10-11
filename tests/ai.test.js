import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { createEvaluator, DEFAULT_MODELS, validateAttempt, errorResult, AiError } from "../server/ai.js";
import { LEVEL } from "../src/level.js";
import { SCORE_DIMENSIONS } from "../src/scoring.js";
const root=fileURLToPath(new URL("../",import.meta.url));
const input=text=>({levelId:LEVEL.id,text});
const controller=()=>new AbortController();
const png="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
const judge=(status="success")=>({status,normalized:"用绳子荡过去",understanding:"你想抓住吊绳过河。",objectIds:["swing_rope","princess"],actions:["抓住","摆荡"],confidence:.9,reason:"绳子固定在树枝上，摆荡能到另一边。",question:status==="clarify"?"你想使用哪个物体？":"",changes:"公主抓住吊绳摆到右岸。",
  checks:status==="success"?{clarity:"pass",constraints:"pass",physics:"pass",goal:"pass"}:status==="failure"?{clarity:"pass",constraints:"pass",physics:"fail",goal:"not_evaluated"}:{clarity:"unclear",constraints:"not_evaluated",physics:"not_evaluated",goal:"not_evaluated"},
  scores:status==="success"?SCORE_DIMENSIONS.map(d=>({dimension:d.id,score:7,reason:"这次方案体现了具体的思考。"})):[]});
const narration={consistent:true,understanding:"你想用吊绳过河。",change:"公主到达了另一边。",reason:"绳子固定住，摆荡时托住了她。"};
function mockTransport(sequence,calls) {
  return async(url,options)=>{
    calls.push({url,body:JSON.parse(options.body),headers:options.headers});
    const item=sequence.shift(); if(item instanceof Error)throw item;
    if(item?.http) return new Response("{}",{status:item.http});
    return Response.json(url.endsWith("/images/generations")?{data:[{b64_json:item || png}]}:{choices:[{message:{content:typeof item==="string"?item:JSON.stringify(item)}}]});
  };
}
function evaluator(sequence,calls=[],key="test-key") { return createEvaluator({root,config:{key,textModel:DEFAULT_MODELS.text,imageModel:DEFAULT_MODELS.image},transport:mockTransport(sequence,calls)}); }
test("没有密钥不调用远程、不返回通关",async()=>{
  const calls=[];const r=await evaluator([],calls,"")(input("搭石头过河"),controller().signal);
  assert.equal(r.status,"unavailable");assert.equal(calls.length,0);
});
test("完整调用链使用指定模型、原图，无 UI，最后核对才返回成功",async()=>{
  const calls=[];const r=await evaluator([judge(),png,narration],calls)(input("用绳子荡过去"),controller().signal);
  assert.equal(r.status,"success");assert.equal(calls.length,3);
  assert.equal(r.scores.length,5);assert.equal(r.scores[0].name,"物理推理");
  assert.equal(calls[0].body.model,"doubao-seed-2-1-pro-260915");
  assert.equal(calls[1].body.model,"doubao-seedream-5-0-flash-260915");
  assert.equal(calls[1].body.size,"1672x941");assert.equal(calls[1].body.response_format,"b64_json");
  assert.ok(calls[1].body.image[0].startsWith("data:image/jpeg;base64,"));
  assert.equal(calls[1].body.image.length,3);
  assert.ok(calls[1].body.prompt.includes("girl.png"));assert.ok(calls[1].body.prompt.includes("rope_tree.png"));
  assert.equal(calls[0].body.messages[0].role,"system");assert.equal(calls[0].body.messages[1].role,"user");
});
test("借用本地物体素材、合并重复滑轮参考，最多10张图",async()=>{
  const calls=[];const j={...judge(),objectIds:["bridge","barrels","pulley","long_rope","stones","swing_rope"]};
  await evaluator([j,png,narration],calls)(input("组合图中物体过河"),controller().signal);
  assert.equal(calls[1].body.image.length,10);assert.equal(new Set(calls[1].body.image).size,10);
  assert.ok(calls[1].body.prompt.includes("barrels_pair.png"));assert.ok(calls[1].body.prompt.includes("bridge_plank_tall.png"));
  assert.ok(calls[1].body.prompt.includes("rope_tree.png"));
});
test("失败不是系统异常",async()=>{const r=await evaluator([judge("failure"),png,narration])(input("把叶子铺满河流"),controller().signal);assert.equal(r.status,"failure");});
test("追问只调用文字、不生成图片",async()=>{
  const calls=[];const r=await evaluator([judge("clarify")],calls)(input("把它弄过去"),controller().signal);
  assert.equal(r.status,"clarify");assert.equal(calls.length,1);
});
test("五次追问后要求重述，不再调用模型",async()=>{
  const calls=[];const r=await evaluator([],calls)({...input("再把它弄过去"),context:Array.from({length:5},()=>({text:"把它弄过去",question:"哪个物体？"}))},controller().signal);
  assert.equal(r.status,"system_error");assert.equal(calls.length,0);
});
test("拒绝无效对象ID与格式错误",async()=>{
  await assert.rejects(evaluator([{...judge(),objectIds:["magic_boat"]}])(input("用绳子荡过去"),controller().signal),e=>e.kind==="format");
  await assert.rejects(evaluator(["not-json"])(input("用绳子荡过去"),controller().signal),e=>e.kind==="format");
});
test("明显矛盾的图不产生成功状态",async()=>{
  await assert.rejects(evaluator([judge(),png,{...narration,consistent:false}])(input("用绳子荡过去"),controller().signal),e=>e.kind==="image");
});
test("401、429、损坏图片分别映射为系统错误",async()=>{
  for(const [sequence,kind] of [[[ {http:401} ],"auth"],[[{http:429}],"quota"],[[judge(),"bm90LXBpY3R1cmU="],"image"]]){
    try {await evaluator(sequence)(input("用绳子荡过去"),controller().signal);assert.fail();}catch(e){assert.equal(e.kind,kind);assert.equal(errorResult(e).status,"system_error");}
  }
});
test("长度、关卡、上下文不能绕过入口校验",()=>{
  for(const body of [input(""),input("好".repeat(81)),{...input("搭石头"),levelId:"other"},{...input("搭石头"),context:"bad"}])assert.throws(()=>validateAttempt(body),AiError);
});
test("判定不得跳步；成功必须有五项有效评分",async()=>{
  const base=judge();
  for(const j of [
    {...base,checks:{clarity:"unclear",constraints:"pass",physics:"pass",goal:"pass"}},
    {...base,scores:[]}, {...base,scores:base.scores.map(s=>({...s,score:11}))},
    {...base,scores:base.scores.map(s=>({...s,dimension:"physical"}))},
    {...judge("failure"),scores:base.scores}
  ]) await assert.rejects(evaluator([j])(input("用绳子荡过去"),controller().signal),e=>e.kind==="format");
  const edge={...base,scores:base.scores.map((s,i)=>({...s,score:i%2?10:0}))};
  const result=await evaluator([edge,png,narration])(input("用绳子荡过去"),controller().signal);
  assert.equal(result.scores[0].score,0);assert.equal(result.scores[1].score,10);
});
