/** iOS-style system colors with a subtle warm tint */
export const Spring = {
  light: {
    sky: '#F2F2F7',
    peach: '#FFFFFF',
    peachDeep: '#E5E5EA',
    blush: '#F2F2F7',
    blossom: '#E5E5EA',
    blossomDeep: '#D1D1D6',
    cherry: '#007AFF',
    petal: '#FFFFFF',
    text: '#000000',
    textSoft: '#3C3C43',
    textMuted: '#8E8E93',
    card: '#FFFFFF',
    cardBorder: 'transparent',
    shadow: 'transparent',
    separator: '#C6C6C8',
    fill: 'rgba(118, 118, 128, 0.12)',
    success: '#34C759',
    error: '#FF3B30',
  },
  dark: {
    sky: '#000000',
    peach: '#1C1C1E',
    peachDeep: '#2C2C2E',
    blush: '#000000',
    blossom: '#2C2C2E',
    blossomDeep: '#3A3A3C',
    cherry: '#0A84FF',
    petal: '#1C1C1E',
    text: '#FFFFFF',
    textSoft: '#EBEBF5',
    textMuted: '#8E8E93',
    card: '#1C1C1E',
    cardBorder: 'transparent',
    shadow: 'transparent',
    separator: '#38383A',
    fill: 'rgba(118, 118, 128, 0.24)',
    success: '#30D158',
    error: '#FF453A',
  },
} as const;

export const SpringRadii = {
  sm: 8,
  md: 10,
  lg: 12,
  pill: 10,
} as const;

export type SpringPalette = typeof Spring.light;
