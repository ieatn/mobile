import { StyleSheet, View, type ViewProps } from 'react-native';

import { useSpringPalette } from '@/hooks/use-spring-palette';

export function Screen({ style, children, ...rest }: ViewProps) {
  const palette = useSpringPalette();

  return (
    <View style={[styles.screen, { backgroundColor: palette.sky }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
