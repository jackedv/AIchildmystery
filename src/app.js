import { LEVEL } from "./level.js";
import { readProgress, recordAttempt, STORE_KEY } from "./progress.js";
import { validScores, orderedScores } from "./scoring.js";

const $ = id => document.getElementById(id);
const progress = readProgress(localStorage);
const state = { view: "cover", intro: 0, busy: false, resolved: false, context: [], controller: null, request: 0, composing: false, gesture: false };
let tooltipTimer, selected;
const music = $("background-music"), input = $("idea-input"), send = $("send-idea");
music.volume = .22;
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch {} }
function scaleStage() {
  $("stage").style.transform = "translate(-50%, -50%) scale(" + Math.min(innerWidth / 1672, innerHeight / 941) + ")";
  hideTooltip();
}
addEventListener("resize", scaleStage); scaleStage();
function musicState() {
  $("music-button").setAttribute("aria-pressed", String(progress.sound));
  $("music-button").setAttribute("aria-label", progress.sound ? "关闭音乐" : "播放音乐");
  music.volume = state.view === "intro" ? .10 : .22;
  if (progress.sound && state.gesture && !document.hidden) music.play().catch(() => {});
  else music.pause();
}
function cancelAttempt() { state.request++; state.controller?.abort(); state.controller = null; state.busy = false; input.disabled = false; }
function view(name) {
  cancelAttempt(); hideTooltip(); closeRules();
  state.view = name;
  document.body.dataset.view = name;
  for (const section of document.querySelectorAll(".view")) section.hidden = section.id !== name + "-view";
  $("global-controls").hidden = name === "intro";
  $("back-button").hidden = name === "cover";
  $("back-button").setAttribute("aria-label", name === "levels" ? "返回故事书" : "返回关卡本");
  if (name === "levels") {
    $("completion-mark").hidden = !progress.completed;
    $("enter-level").textContent = progress.completed ? "再玩一次 →" : "开始这一关 →";
    $("next-state").textContent = progress.completed ? "已解锁 · 待开放" : "完成第一关后解锁 · 待开放";
  }
  musicState(); updateInput();
}
function openBook() { state.gesture = true; view("levels"); $("enter-level").focus({preventScroll:true}); }
$("book-cover").addEventListener("click", openBook); $("start-reading").addEventListener("click", openBook);
function resetScene() {
  cancelAttempt(); state.context = []; input.value = ""; $("scene-image").src = LEVEL.scene;
  state.resolved = false;
  $("scene-image").alt = "公主在左岸，观察场景中的物体，想办法安全过河";
  $("feedback").hidden = true; $("input-feedback").hidden = true;
  for (const b of document.querySelectorAll(".hotspot")) b.disabled = false;
  updateInput();
}
function enterLevel() { resetScene(); state.intro = 0; $("intro-text").textContent = LEVEL.intro[0]; view("intro"); $("intro-continue").focus({preventScroll:true}); }
$("level-one").addEventListener("click", enterLevel); $("enter-level").addEventListener("click", enterLevel);
$("intro-continue").addEventListener("click", () => {
  state.intro++;
  if (state.intro < LEVEL.intro.length) $("intro-text").textContent = LEVEL.intro[state.intro];
  else { view("scene"); input.focus({preventScroll:true}); }
});
$("intro-continue").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); $("intro-continue").click(); } });
$("back-button").addEventListener("click", () => view(state.view === "levels" ? "cover" : "levels"));
$("music-button").addEventListener("click", () => { state.gesture = true; progress.sound = !progress.sound; save(); musicState(); });
document.addEventListener("visibilitychange", musicState);
function closeRules() { $("rules-panel").hidden = true; $("goal-button").setAttribute("aria-expanded","false"); }
$("goal-button").addEventListener("click", () => {
  hideTooltip(); $("rules-panel").hidden = !$("rules-panel").hidden;
  $("goal-button").setAttribute("aria-expanded", String(!$("rules-panel").hidden));
});
function hideTooltip() {
  clearTimeout(tooltipTimer); $("object-tooltip").hidden = true;
  if (selected) { selected.dataset.selected = "false"; selected.removeAttribute("aria-describedby"); }
  selected = null;
}
function showTooltip(button, object) {
  hideTooltip(); closeRules(); selected = button; button.dataset.selected = "true";
  button.setAttribute("aria-describedby", "object-tooltip");
  $("tooltip-name").textContent = object.name; $("tooltip-fact").textContent = object.fact;
  const tip = $("object-tooltip"); tip.hidden = false;
  const rect = button.getBoundingClientRect(), bar = $("idea-form").getBoundingClientRect();
  const w = tip.offsetWidth, h = tip.offsetHeight;
  let top = rect.top - h - 12;
  if (top < 12) top = rect.bottom + 12;
  if (top + h > bar.top - 10) top = Math.max(12, Math.min(top, bar.top - h - 12));
  tip.style.left = Math.max(12, Math.min(innerWidth - w - 12, rect.left + rect.width / 2 - w / 2)) + "px";
  tip.style.top = Math.max(12, Math.min(innerHeight - h - 12, top)) + "px";
}
for (const object of LEVEL.objects) for (const area of object.areas) {
  const button = document.createElement("button"); button.type = "button"; button.className = "hotspot";
  button.setAttribute("aria-label", "查看" + object.name); button.dataset.object = object.id;
  const [x,y,w,h] = area;
  Object.assign(button.style, { left:x+"px", top:y+"px", width:w+"px", height:h+"px" });
  button.addEventListener("pointerenter", () => { hideTooltip(); tooltipTimer = setTimeout(() => showTooltip(button,object),300); });
  button.addEventListener("pointerleave", hideTooltip);
  button.addEventListener("focus", () => showTooltip(button,object)); button.addEventListener("blur", hideTooltip);
  button.addEventListener("click", () => showTooltip(button,object)); $("hotspots").append(button);
}
document.addEventListener("keydown", e => { if(e.key==="Escape") { hideTooltip(); closeRules(); } });
document.addEventListener("pointerdown", e => { if (!e.target.closest(".hotspot")) hideTooltip(); if(!e.target.closest("#rules-panel,#goal-button")) closeRules(); });
function updateInput() { send.disabled = state.busy || state.resolved || state.composing || !input.value.trim(); input.disabled = state.busy || state.resolved; }
input.addEventListener("input", () => { $("input-feedback").hidden = true; updateInput(); });
input.addEventListener("compositionstart", () => { state.composing = true; updateInput(); });
input.addEventListener("compositionend", () => { state.composing = false; updateInput(); });
input.addEventListener("keydown", e => { if(e.key==="Enter" && (e.isComposing || state.composing || e.keyCode===229)) e.preventDefault(); });
function action(label, callback, secondary=false) {
  const b = document.createElement("button"); b.type = "button"; b.textContent = label; if(secondary) b.className = "secondary";
  b.addEventListener("click", callback); $("feedback-actions").append(b);
}
function retry() { resetScene(); input.focus({preventScroll:true}); }
function showScores(scores) {
  const ordered = orderedScores(scores), ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns,"svg"); svg.setAttribute("viewBox","0 0 360 280"); svg.setAttribute("role","img");
  svg.setAttribute("aria-label","五边形评分图："+ordered.map(s=>s.name+s.score+"分").join("，"));
  const point = (i,r) => [180 + Math.sin(i*2*Math.PI/5)*r, 142 - Math.cos(i*2*Math.PI/5)*r];
  const points = r => ordered.map((_,i)=>point(i,r).join(",")).join(" ");
  function shape(tag,attrs,text) { const node=document.createElementNS(ns,tag); for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v); if(text)node.textContent=text;svg.append(node); }
  for(let value=2;value<=10;value+=2) {
    shape("polygon",{points:points(value*8.4),fill:"none",stroke:"#cdb38b","stroke-width":1});
    shape("text",{x:185,y:142-value*8.4+5,"font-size":10,fill:"#806142"},String(value));
  }
  shape("text",{x:185,y:148,"font-size":10,fill:"#806142"},"0");
  ordered.forEach((s,i)=>{const p=point(i,84);shape("line",{x1:180,y1:142,x2:p[0],y2:p[1],stroke:"#cdb38b"});});
  shape("polygon",{points:ordered.map((s,i)=>point(i,s.score*8.4).join(",")).join(" "),fill:"#3f7758","fill-opacity":.22,stroke:"#356047","stroke-width":3});
  ordered.forEach((s,i)=>{
    const p=point(i,s.score*8.4),label=point(i,112);
    shape("circle",{cx:p[0],cy:p[1],r:4,fill:"#356047"});
    shape("text",{x:label[0],y:label[1],"text-anchor":"middle","font-size":16,"font-weight":700,fill:"#624225"},s.name);
    shape("text",{x:label[0],y:label[1]+20,"text-anchor":"middle","font-size":15,fill:"#356047"},s.score+" / 10");
  });
  $("score-chart").replaceChildren(svg); $("score-reasons").replaceChildren();
  for(const s of ordered) { const li=document.createElement("li"),strong=document.createElement("strong"),p=document.createElement("p");strong.textContent=s.name+" · "+s.score+"分";p.textContent=s.reason;li.append(strong,p);$("score-reasons").append(li); }
}
function feedback(result) {
  const box=$("feedback"); box.dataset.status=result.status; box.hidden=false;
  $("feedback-actions").replaceChildren(); $("feedback-note").hidden=true;
  $("score-panel").hidden=result.status!=="success";
  $("feedback-kicker").textContent = result.status === "success" ? "故事向前翻了一页" : result.status === "failure" ? "再想一想，还会有别的办法" : "";
  const titles={success:"成功",failure:"这次方案没有成功",clarify:"再告诉我一点",unavailable:"AI 尚未接入",system_error:"这次没能完成思考"};
  $("feedback-title").textContent=titles[result.status] || titles.system_error;
  $("feedback-text").textContent=result.status==="clarify" ? result.question : [result.understanding,result.change,result.reason].filter(Boolean).join(" ") || result.message;
  if(result.status==="success") {
    showScores(result.scores);
    $("feedback-note").hidden=false; $("feedback-note").textContent="下一关已解锁，故事还在准备中。";
    action("再试一种方法",retry); action("返回关卡本",()=>view("levels"),true);
  } else if(result.status==="failure") {
    action("重新描述",retry); action("查看物体信息",()=>{ retry(); document.querySelector('.hotspot[data-object="bridge"]').focus(); },true);
  } else if(result.status==="clarify") {
    action("重新描述方案",retry,true); input.focus({preventScroll:true}); input.select();
  } else { action("收起提示",()=>{box.hidden=true;input.focus({preventScroll:true});},true); input.focus({preventScroll:true}); }
}
function validateResponse(result) {
  if(!result || !["success","failure","clarify","unavailable","system_error"].includes(result.status)) throw new Error("invalid response");
  if(["success","failure"].includes(result.status) && (!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(result.image || "") || !result.reason)) throw new Error("invalid result");
  if(result.status==="clarify" && typeof result.question!=="string") throw new Error("invalid question");
  if(result.status==="success" && !validScores(result.scores)) throw new Error("invalid scores");
  return result;
}
$("idea-form").addEventListener("submit", async e => {
  e.preventDefault(); if(state.busy || state.resolved || state.composing || !input.value.trim()) return;
  const text=input.value.trim(), length=Array.from(text).length;
  if(length<3 || length>80) { $("input-feedback").textContent="用 3–80 个字，把你的想法写成一句话吧。"; $("input-feedback").hidden=false; return; }
  if(state.context.length>=5) { feedback({status:"system_error",message:"我们已经问了五次。请重新描述一个完整的方案，再试一次。"}); action("重新描述方案",retry); return; }
  state.busy=true; hideTooltip(); closeRules(); $("feedback").hidden=true;
  const request=++state.request, controller=new AbortController(); state.controller=controller;
  input.value="正在理解你的想法……"; updateInput();
  const timeout=setTimeout(()=>controller.abort("timeout"),180000);
  try {
    const response=await fetch("/api/attempt",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({levelId:LEVEL.id,text,context:state.context}),signal:controller.signal});
    if(!response.ok) throw new Error("request failed");
    const result=validateResponse(await response.json());
    if(request!==state.request || state.view!=="scene") return;
    input.value=text;
    if(result.status==="clarify") state.context.push({text,question:result.question});
    else if(["success","failure"].includes(result.status)) {
      // Decode before committing progress. A broken result image is a system error.
      const img=new Image(); img.src=result.image; await img.decode();
      if(request!==state.request || state.view!=="scene") return;
      $("scene-image").src=result.image; $("scene-image").alt=result.change || "你的想法产生的结果画面";
      state.resolved=true;
      for(const b of document.querySelectorAll(".hotspot")) b.disabled=true;
      state.context=[]; recordAttempt(progress,text,result); save();
    }
    if(!["success","failure"].includes(result.status)) { recordAttempt(progress,text,result); save(); }
    state.busy=false;updateInput();feedback(result);
  } catch(error) {
    if(request!==state.request || state.view!=="scene") return;
    input.value=text; state.busy=false; updateInput();
    const result={status:"system_error",message:controller.signal.aborted ? "思考时间有点长，请稍后重试。" : "暂时没能连接思考服务。你的想法还在，请稍后重试。"};
    recordAttempt(progress,text,result);save();feedback(result);
  } finally {
    clearTimeout(timeout);
    if(request===state.request) { state.busy=false; state.controller=null; input.value=text;updateInput(); }
  }
});
view("cover"); save();
