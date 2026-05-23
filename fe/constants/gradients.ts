/**
 * Gradient presets for Tapestry — warm, muted, iridescent.
 * Inspired by ElevenLabs' analog-tactile style but adapted
 * to Tapestry's warm off-white editorial aesthetic.
 */

export type GradientPreset = {
  colors: readonly [string, string, ...string[]];
  start: { x: number; y: number };
  end: { x: number; y: number };
  locations?: readonly [number, number, ...number[]];
};

// Warm community tones — peach -> lavender
export const warmGlow: GradientPreset = {
  colors: ['#f5cec7', '#e4c1d9', '#c9b1d0', '#a8b5cf'] as const,
  start: { x: 0.1, y: 0.0 },
  end: { x: 0.9, y: 1.0 },
  locations: [0, 0.35, 0.65, 1] as const,
};

// Earthy welcome — cream -> sage -> dusty rose
export const earthBloom: GradientPreset = {
  colors: ['#f0e6d3', '#d4cfb4', '#b8c9a9', '#c9b1a5'] as const,
  start: { x: 0.0, y: 0.2 },
  end: { x: 1.0, y: 0.8 },
  locations: [0, 0.3, 0.6, 1] as const,
};

// Soft dawn — pale gold -> warm blush -> misty blue
export const softDawn: GradientPreset = {
  colors: ['#f5e6d0', '#edc9b7', '#d4b4c4', '#b8c4d4'] as const,
  start: { x: 0.2, y: 0.0 },
  end: { x: 0.8, y: 1.0 },
  locations: [0, 0.3, 0.6, 1] as const,
};

// Muted iridescent — the signature orb adapted warmer
export const iridescent: GradientPreset = {
  colors: ['#e8d5c4', '#dbb8a0', '#c9a0b8', '#a8b8c9', '#b8c9a8'] as const,
  start: { x: 0.1, y: 0.1 },
  end: { x: 0.9, y: 0.9 },
  locations: [0, 0.25, 0.5, 0.75, 1] as const,
};

// Minimal — barely-there tint for subtle card accents
export const whisper: GradientPreset = {
  colors: ['#f5f0ec', '#f0ebe8', '#ece8ed', '#e8ecf0'] as const,
  start: { x: 0.0, y: 0.0 },
  end: { x: 1.0, y: 1.0 },
  locations: [0, 0.33, 0.66, 1] as const,
};

// Category-specific gradients for dashboard cards
export const categoryGradients: Record<string, GradientPreset> = {
  people: {
    colors: ['#f5cec7', '#e8d0d8', '#ddd5e4'] as const,
    start: { x: 0.0, y: 0.0 },
    end: { x: 1.0, y: 1.0 },
  },
  events: {
    colors: ['#f5e6d0', '#e8dcc0', '#d4cfb4'] as const,
    start: { x: 0.0, y: 0.0 },
    end: { x: 1.0, y: 1.0 },
  },
  communities: {
    colors: ['#d4e4d0', '#c8d8c4', '#b8c9a9'] as const,
    start: { x: 0.0, y: 0.0 },
    end: { x: 1.0, y: 1.0 },
  },
  services: {
    colors: ['#d0dce8', '#c4d0dc', '#b8c4d4'] as const,
    start: { x: 0.0, y: 0.0 },
    end: { x: 1.0, y: 1.0 },
  },
  requests: {
    colors: ['#e8d8e0', '#dcd0dc', '#d0c8d4'] as const,
    start: { x: 0.0, y: 0.0 },
    end: { x: 1.0, y: 1.0 },
  },
};
