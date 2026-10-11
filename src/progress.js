export const STORE_KEY = "ai-child-mystery-state-v2";
export function readProgress(storage) {
  let current, old;
  try { current = JSON.parse(storage.getItem(STORE_KEY)); } catch {}
  if (current?.version === 2) return {
    version: 2, completed: current.completed === true, sound: current.sound !== false,
    attempts: Array.isArray(current.attempts) ? current.attempts.slice(-50) : [],
    legacyHistory: Array.isArray(current.legacyHistory) ? current.legacyHistory.slice(-50) : []
  };
  try { old = JSON.parse(storage.getItem("ai-child-mystery-state-v1")); } catch {}
  // Only historical game records migrate. Never carry forward browser-stored credentials.
  const result = { version: 2, completed: false, sound: old?.sound !== false, attempts: [],
    legacyHistory: Array.isArray(old?.attempts) ? old.attempts.slice(-50).map(x => ({
      text: String(x.input || x.text || "").slice(0,160), status: "旧版演示", date: x.date || x.at || null
    })) : [] };
  try { storage.setItem(STORE_KEY, JSON.stringify(result)); storage.removeItem("ai-child-mystery-state-v1"); } catch {}
  return result;
}
export function recordAttempt(progress, text, result) {
  if (!["success", "failure", "clarify", "system_error"].includes(result.status)) return;
  progress.attempts.push({ text, status: result.status, at: new Date().toISOString(), ...(result.status === "success" ? {scores: result.scores} : {}) });
  progress.attempts = progress.attempts.slice(-50);
  if (result.status === "success") progress.completed = true;
}
