import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AuthRouteGuard } from '@/components/auth-route-guard';
import { Spring } from '@/constants/spring-theme';
import { AuthProvider } from '@/providers/auth-provider';

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Spring.light.cherry,
    background: Spring.light.sky,
    card: Spring.light.card,
    text: Spring.light.text,
    border: Spring.light.separator,
  },
};

const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Spring.dark.cherry,
    background: Spring.dark.sky,
    card: Spring.dark.card,
    text: Spring.dark.text,
    border: Spring.dark.separator,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? AppDarkTheme : LightTheme}>
        <AuthRouteGuard>
          <Slot />
        </AuthRouteGuard>
      </ThemeProvider>
    </AuthProvider>
  );
}
