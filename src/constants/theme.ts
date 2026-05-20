/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

import { Spring } from '@/constants/spring-theme';

export const Colors = {
  light: {
    text: Spring.light.text,
    background: Spring.light.sky,
    backgroundElement: Spring.light.card,
    backgroundSelected: Spring.light.peachDeep,
    textSecondary: Spring.light.textMuted,
    accent: Spring.light.cherry,
    accentSoft: Spring.light.blossom,
  },
  dark: {
    text: Spring.dark.text,
    background: Spring.dark.sky,
    backgroundElement: Spring.dark.card,
    backgroundSelected: Spring.dark.peachDeep,
    textSecondary: Spring.dark.textMuted,
    accent: Spring.dark.cherry,
    accentSoft: Spring.dark.blossom,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    display: 'System',
    sansMedium: 'System',
    sansBold: 'System',
    mono: 'Menlo',
  },
  default: {
    sans: 'System',
    display: 'System',
    sansMedium: 'System',
    sansBold: 'System',
    mono: 'monospace',
  },
  web: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    display: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    sansMedium: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    sansBold: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    mono: 'ui-monospace, monospace',
  },
})!;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;
