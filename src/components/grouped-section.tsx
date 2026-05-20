import { StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useSpringPalette } from '@/hooks/use-spring-palette';

type GroupedSectionProps = ViewProps & {
  title?: string;
  footer?: string;
};

export function GroupedSection({ title, footer, style, children, ...rest }: GroupedSectionProps) {
  const palette = useSpringPalette();

  return (
    <View style={styles.wrap}>
      {title ? (
        <ThemedText type="small" style={[styles.header, { color: palette.textMuted }]}>
          {title.toUpperCase()}
        </ThemedText>
      ) : null}
      <View
        style={[styles.group, { backgroundColor: palette.card }, style]}
        {...rest}>
        {children}
      </View>
      {footer ? (
        <ThemedText type="small" style={[styles.footer, { color: palette.textMuted }]}>
          {footer}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: 20,
  },
  header: {
    marginLeft: 16,
    marginBottom: 6,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  group: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  footer: {
    marginLeft: 16,
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
});
