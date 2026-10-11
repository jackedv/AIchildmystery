import { test } from "node:test";
import assert from "node:assert/strict";
import {readProgress,recordAttempt,STORE_KEY} from "../src/progress.js";
import {LEVELS} from "../src/level.js";
const storage=values=>({getItem:k=>values[k],setItem:(k,v)=>values[k]=v,removeItem:k=>delete values[k]});
test("旧演示只迁移历史，删除旧浏览器密钥",()=>{
  const values={"ai-child-mystery-state-v1":JSON.stringify({apiKey:"old-secret",completed:[1],attempts:[{input:"搭石头"}]})};
  const r=readProgress(storage(values));assert.deepEqual(r.completed,[]);assert.equal(r.legacyHistory[0].status,"旧版演示");
  assert.ok(!JSON.stringify(values).includes("old-secret"));assert.ok(values[STORE_KEY]);
});
test("错误、未配置和失败不通关，重玩不清除历史完成",()=>{
  const r=readProgress(storage({}));recordAttempt(r,"叶子过河",{status:"failure"});recordAttempt(r,"再试一次",{status:"system_error"});
  recordAttempt(r,"再试一次",{status:"unavailable"});assert.deepEqual(r.completed,[]);assert.equal(r.attempts.length,2);
  recordAttempt(r,"用绳过河",{status:"success"});recordAttempt(r,"叶子过河",{status:"failure"});assert.deepEqual(r.completed,[LEVELS[0].id]);
});

test("真实第一关进度迁移后解锁第二关，但不伪造第二关完成",()=>{
  const values={"ai-child-mystery-state-v2":JSON.stringify({version:2,completed:true,sound:false,attempts:[{text:"用长板过河",status:"success"}]})};
  const r=readProgress(storage(values));assert.deepEqual(r.completed,[LEVELS[0].id]);assert.equal(r.sound,false);assert.equal(r.attempts[0].levelId,LEVELS[0].id);
  recordAttempt(r,"从侧门进入",{status:"success"},LEVELS[1].id);assert.deepEqual(r.completed,LEVELS.map(l=>l.id));assert.equal(r.attempts.at(-1).levelId,LEVELS[1].id);
  recordAttempt(r,"不成立的方案",{status:"failure"},LEVELS[1].id);assert.equal(r.completed.length,2);
});
