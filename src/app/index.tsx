import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const WARM = {
  light: '#FFF8F0',
  dark: '#1C1510',
} as const;

export default function HomeScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <ThemedView style={[styles.container, { backgroundColor: isDark ? WARM.dark : WARM.light }]}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.greeting}>
          {getGreeting()}
        </ThemedText>
        <ThemedText type="default" themeColor="textSecondary" style={styles.message}>
          Glad you&apos;re here.
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  greeting: {
    fontSize: 36,
    lineHeight: 42,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  message: {
    marginTop: Spacing.three,
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 26,
  },
});
