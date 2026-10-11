(() => {
  "use strict";

  const SCENE = { width: 1672, height: 941 };
  const ASSET_DIR = "assets/scene/";
  const LEVEL_CONFIG = {
    id: "castle_rescue_01",
    title: "村庄河边：踏上旅途",
    goal: "让公主安全到达河对岸",
    constraints: ["只使用场景已有物体", "不能改变河流宽度和方向", "用一句话描述"],
    facts: [
      { id: "river_01", label: "河流", text: "宽 4 米，水深 0.4 米，水流缓慢，方向固定。" },
      { id: "log_01", label: "倒木", text: "长 5 米，可推动，不能漂浮。" },
      { id: "vine_01", label: "藤蔓", text: "长 8 米，承重 60 千克，可打结。" },
      { id: "stone_01_06", label: "河边石头", text: "每块可承重 70 千克，不能漂浮，可排列。" },
      { id: "board_01", label: "木板", text: "长 2 米，可与空桶绑在一起做筏面。" },
      { id: "barrel_01_02", label: "两个空桶", text: "每只浮力 80 千克，可绑在木板下方。" },
      { id: "post_left_right", label: "两根木桩", text: "固定在岸边，可作为绑缚点。" },
    ],
    methods: {
      "M-01": { name: "树干桥", success: "倒木横放在河面，两端各落在稳定岸地。", keywords: ["树干", "倒木", "木头"], needs: ["桥", "河"] },
      "M-02": { name: "藤蔓扶手与石路", success: "藤蔓系在木桩上，石头排成连续落脚点。", keywords: ["藤蔓", "绳", "石头"], needs: ["木桩", "石头"] },
      "M-03": { name: "双桶木板筏", success: "两个空桶绑在木板下方，木板保持水平漂浮。", keywords: ["桶", "木板"], needs: ["绑"] },
      "M-04": { name: "连续石路", success: "六块石头排成连续路线，最后一块靠近对岸。", keywords: ["石头"], needs: ["排"] },
    }
  };

  const LEVELS = [
    { number: 1, title: "村庄河边", summary: "让公主安全到达河对岸。", thumbnail: "河边", intro: ["公主来到村口，城堡方向的河流挡住了去路。", "你能利用身边的东西，帮她安全到达对岸吗？"] },
    { number: 2, title: "风车坡", summary: "跨过断路，抵达对面的高地。", thumbnail: "断路", intro: ["风车坡上的路断开了，城堡就在对面。", "找到稳定的支撑，帮公主跨过这段高度差吧。"] },
    { number: 3, title: "迷雾森林", summary: "找到不经过沼泽的城堡后门。", thumbnail: "森林", intro: ["迷雾森林里有三条路，只有一条不会陷进沼泽。", "观察线索，带公主找到城堡的后门吧。"] },
    { number: 4, title: "城堡门口", summary: "不触发警报进入城堡。", thumbnail: "城门", intro: ["守卫站在城门前，警铃就在他的身边。", "不伤害任何人，也不要触发警报，想办法进去吧。"] },
    { number: 5, title: "地牢牢房", summary: "打开牢门，带王子走到出口。", thumbnail: "地牢", intro: ["王子就在牢房里，钥匙悬在栏杆外。", "用身边的东西打开牢门，带他一起离开地牢吧。"] },
  ];

  const HOTSPOTS = [
    { id: "river_01", label: "河流", factId: "river_01", left: 33, top: 48, width: 39, height: 42 },
    { id: "log_01", label: "旧桥板", factId: "log_01", left: 26, top: 27, width: 11, height: 34 },
    { id: "vine_01", label: "树枝上的绳圈", factId: "vine_01", left: 27, top: 4, width: 7, height: 26 },
    { id: "barrel_01_02", label: "空桶", factId: "barrel_01_02", left: 72, top: 54, width: 16, height: 18 },
    { id: "post_left_right", label: "固定木架", factId: "post_left_right", left: 80, top: 26, width: 17, height: 39 },
    { id: "stone_01_06", label: "岸边石头", factId: "stone_01_06", left: 5, top: 51, width: 19, height: 21 },
    { id: "board_01", label: "木板", factId: "board_01", left: 26, top: 27, width: 11, height: 34 },
  ];

  const ASSETS = [
    ["rock_01.png", 40, 485, 242, 153, "rock rock-1"], ["rock_02.png", 206, 560, 183, 94, "rock rock-2"],
    ["rock_03.png", 1114, 546, 143, 73, "rock rock-3"], ["rock_04.png", 1498, 629, 167, 85, "rock rock-4"],
    ["rope_tree.png", 449, 76, 55, 220, "rope-tree"], ["rope_pulley.png", 1137, 270, 523, 319, "rope-pulley"],
    ["pulley_rig.png", 1364, 253, 235, 370, "pulley-rig"], ["bridge_plank.png", 454, 251, 168, 332, "bridge"],
    ["barrel_01.png", 1257, 522, 135, 144, "barrel-1"], ["barrel_02.png", 1378, 537, 139, 146, "barrel-2"],
  ];

  const STORE_KEY = "ai-child-mystery-state-v1";
  const saved = readJson(STORE_KEY, {});
  const state = {
    inspected: Array.isArray(saved.inspected) ? saved.inspected : [],
    attempts: Array.isArray(saved.attempts) ? saved.attempts : [],
    unlocked: Number(saved.unlocked) || 1,
    completed: Array.isArray(saved.completed) ? saved.completed : [],
    currentLevel: 1,
    view: "book",
    introIndex: 0,
    sound: saved.sound !== false,
    mode: saved.mode === "api" ? "api" : "demo",
    endpoint: saved.endpoint || "https://api.openai.com/v1/chat/completions",
    model: saved.model || "gpt-4o-mini",
    apiKey: saved.apiKey || "",
    scenario: saved.scenario || "default",
  };

  const $ = (id) => document.getElementById(id);
  const scene = $("scene"), hotspots = $("hotspots"), facts = $("fact-list"), resultCard = $("result-card");
  const planInput = $("plan-input"), submit = $("submit-button"), modeBadge = $("mode-badge");
  const settingsDialog = $("settings-dialog"), settingsForm = $("settings-form");

  function readJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch (_) { return fallback; } }
  function save() { localStorage.setItem(STORE_KEY, JSON.stringify({ ...state, apiKey: state.apiKey })); }
  function pct(value, total) { return `${(value / total) * 100}%`; }

  function playPageSound() {
    if (!state.sound) return;
    try { const AudioContext = window.AudioContext || window.webkitAudioContext; const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.frequency.value = 520; gain.gain.setValueAtTime(.035, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .18); osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .18); } catch (_) { /* 音效不可用时不影响游戏 */ }
  }

  function showView(view) {
    state.view = view;
    ["book", "levels", "intro", "game"].forEach((name) => { const node = $(`view-${name}`); if (node) node.hidden = name !== view; });
    $("app-header").hidden = view !== "game";
    if (view === "levels") renderLevelCards();
    if (view === "game") { renderScene(); renderFacts(); renderProgress(); renderMode(); planInput.focus(); }
    save();
  }

  function renderLevelCards() {
    const container = $("level-cards");
    container.innerHTML = LEVELS.map((level) => {
      const isCompleted = state.completed.includes(level.number);
      const isAvailable = level.number <= state.unlocked;
      const status = isCompleted ? "已完成 · 再玩一次" : isAvailable ? "可以挑战 →" : "完成上一关后解锁";
      const className = isCompleted ? "completed" : isAvailable ? "available" : "locked";
      return `<button class="level-card ${className}" type="button" data-level="${level.number}" ${isAvailable ? "" : "disabled"}><span class="level-thumb" aria-hidden="true"></span><span class="level-number">第 ${level.number} 关</span><h3>${escapeHtml(level.title)}</h3><span class="level-summary">${escapeHtml(level.summary)}</span><span class="level-state">${status}</span></button>`;
    }).join("");
    container.querySelectorAll(".level-card:not([disabled])").forEach((card) => card.addEventListener("click", () => openLevel(Number(card.dataset.level))));
  }

  function openLevel(number) {
    state.currentLevel = number;
    state.introIndex = 0;
    playPageSound();
    renderIntro();
    showView("intro");
  }

  function renderIntro() {
    const level = LEVELS[state.currentLevel - 1];
    $("intro-copy").innerHTML = `<p>${escapeHtml(level.intro[state.introIndex])}</p>`;
    $("intro-continue").textContent = state.introIndex < level.intro.length - 1 ? "继续" : "进入场景";
  }

  function advanceIntro() {
    const level = LEVELS[state.currentLevel - 1];
    if (state.introIndex < level.intro.length - 1) { state.introIndex += 1; renderIntro(); playPageSound(); return; }
    if (state.currentLevel !== 1) { showToast("这一页的场景正在准备中，先从第一关开始吧。"); showView("levels"); return; }
    showView("game");
  }

  function renderScene() {
    scene.querySelectorAll(".scene-asset").forEach((node) => node.remove());
    const background = document.createElement("img"); background.className = "scene-asset"; background.src = `${ASSET_DIR}background.png`; background.alt = "村庄河边绘本背景"; background.style.cssText = "inset:0;width:100%;height:100%;object-fit:cover;z-index:0"; scene.prepend(background);
    for (const [file, x, y, w, _h, className] of ASSETS) {
      const img = document.createElement("img"); img.className = `scene-asset ${className}`; img.src = `${ASSET_DIR}${file}`; img.alt = ""; img.draggable = false;
      img.style.left = pct(x, SCENE.width); img.style.top = pct(y, SCENE.height); img.style.width = pct(w, SCENE.width); img.style.height = "auto"; scene.insertBefore(img, hotspots);
    }
    const girl = document.createElement("img"); girl.className = "scene-asset girl"; girl.src = `${ASSET_DIR}girl.png`; girl.alt = "公主"; scene.insertBefore(girl, hotspots);
    hotspots.innerHTML = "";
    for (const item of HOTSPOTS) {
      const button = document.createElement("button"); button.className = "hotspot"; button.type = "button"; button.dataset.label = item.label; button.setAttribute("aria-label", `查看${item.label}的事实`); button.style.left = `${item.left}%`; button.style.top = `${item.top}%`; button.style.width = `${item.width}%`; button.style.height = `${item.height}%`;
      button.addEventListener("click", () => inspect(item)); hotspots.appendChild(button);
    }
    scene.classList.toggle("scenario-bridge", state.scenario === "bridge");
    scene.classList.toggle("scenario-raft", state.scenario === "raft");
    scene.classList.toggle("scenario-stones", state.scenario === "stones");
  }

  function inspect(item) {
    if (!state.inspected.includes(item.factId)) { state.inspected.push(item.factId); save(); }
    const fact = LEVEL_CONFIG.facts.find((entry) => entry.id === item.factId);
    if (fact) showToast(`${fact.label}：${fact.text}`);
    renderFacts();
  }

  function renderFacts() {
    $("fact-count").textContent = String(state.inspected.length);
    if (!state.inspected.length) { facts.innerHTML = '<p class="empty-state">点击场景物体，线索会出现在这里。</p>'; return; }
    facts.innerHTML = state.inspected.map((id) => { const fact = LEVEL_CONFIG.facts.find((entry) => entry.id === id); return fact ? `<div class="fact-item"><strong>${escapeHtml(fact.label)}</strong>${escapeHtml(fact.text)}</div>` : ""; }).join("");
  }

  function renderProgress() {
    const names = ["河边", "风车坡", "迷雾森林", "守卫门", "地牢"];
    $("progress-count").textContent = `${Math.min(state.unlocked, 5)} / 5`;
    $("level-progress").innerHTML = names.map((name, index) => { const n = index + 1; const cls = n < state.unlocked ? "done" : n === state.unlocked ? "active" : ""; return `<div class="level-step ${cls}"><span class="step-number">${n <= state.unlocked ? "✓" : "·"}</span>${name}</div>`; }).join("");
  }

  function renderMode() { modeBadge.textContent = state.mode === "api" ? "AI API 模式" : "演示模式"; modeBadge.classList.toggle("api", state.mode === "api"); }
  function showToast(message) { const status = $("scene-status"); status.textContent = message; status.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => status.classList.remove("show"), 3600); }
  function setBusy(value) { submit.disabled = value; submit.innerHTML = value ? "正在思考…" : "让 AI 判断 <span>→</span>"; }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }

  function parseDemo(input) {
    const text = input.replace(/[，。！？、]/g, "");
    const has = (...words) => words.some((word) => text.includes(word));
    if (has("倒木", "树干", "木头") && has("桥", "横放", "河")) return { methodId: "M-01", confidence: .98, explanation: "你想把倒木横放在河面上当桥。" };
    if (has("藤蔓", "绳") && has("石头") && has("木桩", "系")) return { methodId: "M-02", confidence: .95, explanation: "你想用藤蔓做扶手，并用石头形成落脚路线。" };
    if (has("桶") && has("木板") && has("绑", "筏", "划")) return { methodId: "M-03", confidence: .95, explanation: "你想把两个空桶绑在木板下做木筏。" };
    if (has("石头") && has("排", "连续", "踩", "六块")) return { methodId: "M-04", confidence: .94, explanation: "你想把石头排成连续路线走过河。" };
    if (has("绳", "藤蔓") && !has("木桩", "固定")) return { methodId: null, confidence: .57, missingInfo: ["你想把绳子固定在哪里？"] };
    return { methodId: null, confidence: .31, missingInfo: ["你想使用哪些场景里的物体？"] };
  }

  async function callAi(input) {
    if (!state.apiKey) throw new Error("还没有填写 API Key");
    const allowed = Object.entries(LEVEL_CONFIG.methods).map(([id, method]) => `${id} ${method.name}：需要 ${method.needs.join("、")}`).join("\n");
    const system = `你是儿童解谜游戏的意图分析器。只识别玩家输入，不裁决成功。只能从以下方法中选择，不能创造新道具：\n${allowed}\n返回严格 JSON：{"methodId":"M-01 或 null","entities":[],"actions":[],"missingInfo":[],"confidence":0,"explanation":""}。如果关键信息缺失，methodId 用 null，并只问一个最关键的问题。`;
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(state.endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${state.apiKey}` }, body: JSON.stringify({ model: state.model, temperature: 0, messages: [{ role: "system", content: system }, { role: "user", content: input }] }), signal: controller.signal });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error?.message || `API 请求失败（${response.status}）`);
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("API 没有返回可解析的内容");
      const cleaned = String(content).replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.methodId && !LEVEL_CONFIG.methods[parsed.methodId]) parsed.methodId = null;
      return parsed;
    } finally { clearTimeout(timeout); }
  }

  function judge(intent, input) {
    if (!intent.methodId) return { status: "CLARIFY", title: "再告诉我一点", copy: intent.missingInfo?.[0] || "你想先用哪个物体？", icon: "?" };
    const method = LEVEL_CONFIG.methods[intent.methodId];
    const text = input.replace(/[，。！？、]/g, "");
    const has = (...words) => words.some((word) => text.includes(word));
    if (intent.methodId === "M-01") {
      if (has("水里", "漂")) return fail("FAIL_PHYSICS", "倒木不能漂浮，需要让两端都落在岸上。", "×");
      state.scenario = "bridge"; return success(method, "桥板落下，河面出现了安全的通路。", "M-01");
    }
    if (intent.methodId === "M-02") {
      if (!has("木桩", "固定", "系")) return { status: "CLARIFY", title: "藤蔓要系在哪里？", copy: "先找到固定的木桩，扶手才不会被拉倒。", icon: "?" };
      if (!has("石头", "排", "连续", "踩")) return fail("FAIL_GOAL", "还需要把石头排成连续的落脚路线。", "×");
      state.scenario = "stones"; return success(method, "藤蔓拉紧了，石头变成一条安全的路。", "M-02");
    }
    if (intent.methodId === "M-03") {
      if (!has("两个", "两只", "两桶", "桶")) return fail("FAIL_PHYSICS", "一只桶的浮力不够，木板会倾斜。", "×");
      if (!has("绑", "固定")) return { status: "CLARIFY", title: "木板要怎么和桶连起来？", copy: "把两个空桶固定在木板下方，木筏才会保持水平。", icon: "?" };
      state.scenario = "raft"; return success(method, "两个空桶托住木板，木筏稳稳地漂向对岸。", "M-03");
    }
    if (intent.methodId === "M-04") {
      if (!has("六块", "六个", "连续", "排")) return fail("FAIL_GOAL", "石头之间要连成连续的落脚点，最后一块要靠近对岸。", "×");
      state.scenario = "stones"; return success(method, "石头一块接一块，公主安全跳到了对岸。", "M-04");
    }
    return fail("SYSTEM_ERROR", "暂时无法完成这次判断，请再试一次。", "!");
  }

  function success(method, copy, methodId) { return { status: "SUCCESS", title: "成功过河！", copy: `${copy} ${method.success}`, icon: "✓", methodId }; }
  function fail(status, copy, icon) { return { status, title: status === "FAIL_GOAL" ? "还差一步" : "这个办法行不通", copy, icon }; }

  function showResult(result, explanation) {
    resultCard.hidden = false; resultCard.className = `result-card story-card ${result.status === "SUCCESS" ? "success" : result.status === "CLARIFY" ? "clarify" : result.status === "SYSTEM_ERROR" ? "system" : "failure"}`;
    $("result-icon").textContent = result.icon || "✦"; $("result-label").textContent = result.status; $("result-title").textContent = result.title; $("result-copy").textContent = explanation ? `${result.copy} ${explanation}` : result.copy;
    $("retry-button").textContent = result.status === "SUCCESS" ? "再试一个办法" : "再想一个办法";
    const continueButton = $("continue-button");
    continueButton.hidden = result.status !== "SUCCESS";
    if (result.status === "SUCCESS") continueButton.textContent = state.currentLevel < 5 ? "继续下一关 →" : "回到关卡本";
  }

  async function submitPlan() {
    const input = planInput.value.trim();
    if (input.length < 3) { showResult({ status: "CLARIFY", title: "先说一句完整的话", copy: "告诉我你准备怎么做。", icon: "?" }); planInput.focus(); return; }
    setBusy(true); resultCard.hidden = true;
    try {
      const intent = state.mode === "api" ? await callAi(input) : parseDemo(input);
      const result = judge(intent, input);
      state.attempts.push({ input, methodId: result.methodId || null, status: result.status, at: new Date().toISOString() });
      if (state.attempts.length > 30) state.attempts.shift();
      if (result.status === "SUCCESS") { state.completed = Array.from(new Set([...state.completed, state.currentLevel])); state.unlocked = Math.max(state.unlocked, Math.min(5, state.currentLevel + 1)); }
      save(); renderScene(); renderProgress(); showResult(result, intent.explanation && state.mode === "api" ? intent.explanation : "");
    } catch (error) {
      showResult({ status: "SYSTEM_ERROR", title: "AI 暂时没有回应", copy: error.name === "AbortError" ? "请求超过 25 秒，检查网络或稍后重试。" : error.message, icon: "!" });
    } finally { setBusy(false); }
  }

  function openSettings() {
    $("mode-select").value = state.mode; $("endpoint-input").value = state.endpoint; $("model-input").value = state.model; $("api-key-input").value = state.apiKey;
    if (typeof settingsDialog.showModal === "function") settingsDialog.showModal(); else settingsDialog.setAttribute("open", "");
  }
  function saveSettings() {
    state.mode = $("mode-select").value === "api" ? "api" : "demo"; state.endpoint = $("endpoint-input").value.trim() || state.endpoint; state.model = $("model-input").value.trim() || state.model; state.apiKey = $("api-key-input").value.trim(); save(); renderMode();
  }

  planInput.addEventListener("input", () => { $("char-count").textContent = `${planInput.value.length} / 80`; submit.disabled = planInput.value.trim().length === 0; });
  planInput.addEventListener("keydown", (event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") submitPlan(); });
  submit.addEventListener("click", submitPlan); $("retry-button").addEventListener("click", () => { resultCard.hidden = true; planInput.focus(); }); $("settings-button").addEventListener("click", openSettings);
  $("start-reading").addEventListener("click", () => { playPageSound(); showView("levels"); });
  $("back-to-book").addEventListener("click", () => { playPageSound(); showView("book"); });
  $("intro-continue").addEventListener("click", advanceIntro);
  $("sound-toggle").addEventListener("click", () => { state.sound = !state.sound; $("sound-toggle").textContent = state.sound ? "🔊 翻书声音" : "🔇 翻书声音"; $("sound-toggle").setAttribute("aria-pressed", String(state.sound)); save(); });
  $("continue-button").addEventListener("click", () => { if (state.currentLevel < 5 && state.unlocked > state.currentLevel) openLevel(state.currentLevel + 1); else showView("levels"); });
  document.addEventListener("keydown", (event) => { if (state.view === "intro" && event.key === "Enter") { event.preventDefault(); advanceIntro(); } });
  settingsForm.addEventListener("submit", (event) => { event.preventDefault(); saveSettings(); settingsDialog.close(); });
  $("clear-key-button").addEventListener("click", () => { state.apiKey = ""; $("api-key-input").value = ""; save(); });

  $("sound-toggle").textContent = state.sound ? "🔊 翻书声音" : "🔇 翻书声音";
  submit.disabled = true;
  showView("book");
})();
