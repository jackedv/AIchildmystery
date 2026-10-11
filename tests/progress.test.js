import { test } from "node:test";
import assert from "node:assert/strict";
import {readProgress,recordAttempt,STORE_KEY} from "../src/progress.js";
const storage=values=>({getItem:k=>values[k],setItem:(k,v)=>values[k]=v,removeItem:k=>delete values[k]});
test("旧演示只迁移历史，删除旧浏览器密钥",()=>{
  const values={"ai-child-mystery-state-v1":JSON.stringify({apiKey:"old-secret",completed:[1],attempts:[{input:"搭石头"}]})};
  const r=readProgress(storage(values));assert.equal(r.completed,false);assert.equal(r.legacyHistory[0].status,"旧版演示");
  assert.ok(!JSON.stringify(values).includes("old-secret"));assert.ok(values[STORE_KEY]);
});
test("错误、未配置和失败不通关，重玩不清除历史完成",()=>{
  const r=readProgress(storage({}));recordAttempt(r,"叶子过河",{status:"failure"});recordAttempt(r,"再试一次",{status:"system_error"});
  recordAttempt(r,"再试一次",{status:"unavailable"});assert.equal(r.completed,false);assert.equal(r.attempts.length,2);
  recordAttempt(r,"用绳过河",{status:"success"});recordAttempt(r,"叶子过河",{status:"failure"});assert.equal(r.completed,true);
});
