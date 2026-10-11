import { LEVELS } from "./level.js";
export const STORE_KEY = "ai-child-mystery-state-v3";
export const hasCompleted = (progress,id) => progress.completed.includes(id);
export function readProgress(storage) {
  let current, old;
  try { current = JSON.parse(storage.getItem(STORE_KEY)); } catch {}
  if (current?.version === 3) return {
    version: 3, completed: Array.isArray(current.completed) ? current.completed.filter(id=>LEVELS.some(level=>level.id===id)) : [], sound: current.sound !== false,
    attempts: Array.isArray(current.attempts) ? current.attempts.slice(-50) : [],
    legacyHistory: Array.isArray(current.legacyHistory) ? current.legacyHistory.slice(-50) : []
  };
  let previous;
  try { previous = JSON.parse(storage.getItem("ai-child-mystery-state-v2")); } catch {}
  try { old = JSON.parse(storage.getItem("ai-child-mystery-state-v1")); } catch {}
  // Only historical game records migrate. Never carry forward browser-stored credentials.
  const result = { version: 3, completed: previous?.version===2 && previous.completed===true ? [LEVELS[0].id] : [], sound: (previous ?? old)?.sound !== false,
    attempts: previous?.version===2 && Array.isArray(previous.attempts) ? previous.attempts.slice(-50).map(x=>({...x,levelId:LEVELS[0].id})) : [],
    legacyHistory: Array.isArray(old?.attempts) ? old.attempts.slice(-50).map(x => ({
      text: String(x.input || x.text || "").slice(0,160), status: "旧版演示", date: x.date || x.at || null
    })) : [] };
  if(Array.isArray(previous?.legacyHistory)) result.legacyHistory=previous.legacyHistory.slice(-50);
  try { storage.setItem(STORE_KEY, JSON.stringify(result)); storage.removeItem("ai-child-mystery-state-v1"); storage.removeItem("ai-child-mystery-state-v2"); } catch {}
  return result;
}
export function recordAttempt(progress, text, result, levelId=LEVELS[0].id) {
  if (!LEVELS.some(level=>level.id===levelId) || !["success", "failure", "clarify", "system_error"].includes(result.status)) return;
  progress.attempts.push({ levelId, text, status: result.status, at: new Date().toISOString(), ...(result.status === "success" ? {scores: result.scores} : {}) });
  progress.attempts = progress.attempts.slice(-50);
  if (result.status === "success" && !hasCompleted(progress,levelId)) progress.completed.push(levelId);
}
