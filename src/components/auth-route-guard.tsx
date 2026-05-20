import { useRouter, useSegments } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Spring } from '@/constants/spring-theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function AuthRouteGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    const onAuthScreen = segments[0] === 'auth';

    if (!session && !onAuthScreen) {
      router.replace('/auth');
    }
  }, [session, loading, segments, router]);

  const isDark = useColorScheme() === 'dark';
  const accent = isDark ? Spring.dark.cherry : Spring.light.cherry;

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: isDark ? Spring.dark.sky : Spring.light.sky }]}>
        <ActivityIndicator size="large" color={accent} />
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
