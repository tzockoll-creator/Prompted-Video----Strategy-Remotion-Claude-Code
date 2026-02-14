// Frame ranges per scene — 30 fps, 90s total = 2700 frames

export const FPS = 30;
export const DURATION_FRAMES = 2700;
export const DURATION_SECONDS = 90;

export const scenes = {
  opening: { start: 0, duration: 300 },       // 0-10s
  foundation: { start: 300, duration: 600 },   // 10-30s
  dataProducts: { start: 900, duration: 600 },  // 30-50s
  aiOrchestration: { start: 1500, duration: 750 }, // 50-75s
  closing: { start: 2250, duration: 450 },     // 75-90s
} as const;
