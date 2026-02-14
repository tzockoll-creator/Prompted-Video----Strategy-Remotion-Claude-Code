// Design tokens for Remotion video — extends src/lib/constants.ts
// Inline styles only (no Tailwind in Remotion render)

export const REGION_COLORS: Record<string, string> = {
  Austin: '#3b82f6',
  'Dallas-Fort Worth': '#8b5cf6',
  Houston: '#06b6d4',
  'San Antonio': '#f59e0b',
};

export const colors = {
  bg: '#020617',
  cardBg: '#0f172a',
  cardBorder: '#1e293b',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  cyan: '#06b6d4',
  cyanGlow: '#22d3ee',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  amber: '#f59e0b',
  green: '#10b981',
  red: '#ef4444',
  white: '#ffffff',
} as const;

export const dimensions = {
  width: 1920,
  height: 1080,
} as const;

export const fonts = {
  heading: 'Inter, system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
  mono: 'JetBrains Mono, monospace',
} as const;
