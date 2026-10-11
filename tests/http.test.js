import { test } from "node:test";
import assert from "node:assert/strict";
import {fileURLToPath} from "node:url";
import {createGameServer} from "../server/http.js";
import {LEVEL} from "../src/level.js";
import {AiError} from "../server/ai.js";
test("本地完整入口可打开，私有文件不可访问，空Key保留未配置状态",async()=>{
  const server=await createGameServer({root:fileURLToPath(new URL("../",import.meta.url)),config:{key:""},journal:false});
  await new Promise(r=>server.listen(0,"127.0.0.1",r));
  const base="http://127.0.0.1:"+server.address().port;
  try {
    for(const file of ["/","/game.html","/landing.css","/src/landing.js","/assets/landing/hero.png","/assets/landing/river.png","/styles.css","/src/app.js","/assets/level-1/scene-initial.png","/assets/level-2/scene-initial.png","/assets/characters/princess-challenge.png","/assets/characters/princess-success.png","/assets/ui/title-board-empty.png","/assets/ui/input-clean.png","/assets/audio/forest.mp3"])assert.equal((await fetch(base+file)).status,200,file);
    const landing=await (await fetch(base+'/')).text();
    assert.equal((landing.match(/href="game.html"/g)||[]).length,3);
    assert.ok(!landing.includes('cdn-cgi') && !landing.includes('showModal'));
    for(const file of ["/.env","/.git/config","/server/ai.js","/prompts/judge.md","/.local/attempts.jsonl","/%2e%2e/.env"])assert.equal((await fetch(base+file)).status,404,file);
    const r=await fetch(base+"/api/attempt",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({levelId:LEVEL.id,text:"搭石头过河"})});
    assert.equal((await r.json()).status,"unavailable");
    assert.equal((await fetch(base+"/api/attempt",{method:"POST",headers:{"Origin":"https://example.com"}})).status,403);
  }finally{await new Promise(r=>server.close(r));}
});
test("服务超时与客户端退出会取消请求，释放重复提交保护",async()=>{
  let observedAbort=0, began;
  const started=new Promise(resolve=>began=resolve);
  const server=await createGameServer({root:fileURLToPath(new URL("../",import.meta.url)),config:{key:""},journal:false,attemptTimeoutMs:100,
    evaluate:async(body,signal)=>{began();await new Promise((resolve,reject)=>{signal.addEventListener("abort",()=>{observedAbort++;reject(new AiError("timeout"));},{once:true});});}
  });
  await new Promise(r=>server.listen(0,"127.0.0.1",r));
  const url="http://127.0.0.1:"+server.address().port+"/api/attempt";
  const options={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({levelId:LEVEL.id,text:"搭石头过河"})};
  try {
    const first=fetch(url,options); await started;
    assert.equal((await fetch(url,options)).status,409);
    const response=await first;assert.equal((await response.json()).status,"system_error");assert.equal(observedAbort,1);
    const controller=new AbortController(); const second=fetch(url,{...options,signal:controller.signal});
    await new Promise(resolve=>setTimeout(resolve,20));controller.abort();await assert.rejects(second);
    await new Promise(resolve=>setTimeout(resolve,20));assert.equal(observedAbort,2);
    assert.equal((await fetch(url,options)).status,200);
  } finally {await new Promise(r=>server.close(r));}
});
