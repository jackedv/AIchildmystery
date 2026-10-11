export const SCORE_DIMENSIONS = [
  { id: "physical", name: "物理推理" },
  { id: "imagination", name: "想象力" },
  { id: "observation", name: "观察力" },
  { id: "planning", name: "规划力" },
  { id: "safety", name: "安全意识" }
];
export function validScores(scores) {
  return Array.isArray(scores) && scores.length === 5 &&
    new Set(scores.map(s => s?.dimension)).size === 5 && scores.every(s =>
      s && SCORE_DIMENSIONS.some(d => d.id === s.dimension) &&
      Number.isInteger(s.score) && s.score >= 0 && s.score <= 10 &&
      typeof s.reason === "string" && s.reason.trim().length > 0 && Array.from(s.reason).length <= 35);
}
export function orderedScores(scores) {
  return SCORE_DIMENSIONS.map(d => ({ ...d, ...scores.find(s => s.dimension === d.id) }));
}
