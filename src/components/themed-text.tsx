import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'largeTitle' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const colorKey = themeColor ?? 'text';
  const color = theme[colorKey];
  const accentColor = 'accent' in theme ? theme.accent : color;

  return (
    <Text
      style={[
        { color },
        type === 'default' && styles.default,
        type === 'largeTitle' && styles.largeTitle,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && [styles.linkPrimary, { color: accentColor }],
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700',
    fontFamily: Fonts.display,
    letterSpacing: Platform.OS === 'ios' ? 0.37 : 0,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    fontFamily: Fonts.display,
    letterSpacing: Platform.OS === 'ios' ? 0.35 : 0,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600',
    fontFamily: Fonts.display,
  },
  default: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: Fonts.sans,
  },
  small: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: Fonts.sans,
  },
  smallBold: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  link: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: Fonts.sans,
  },
  linkPrimary: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: Fonts.sans,
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    lineHeight: 18,
  },
});
