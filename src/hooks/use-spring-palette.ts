import { Spring, type SpringPalette } from '@/constants/spring-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useSpringPalette(): SpringPalette {
  return useColorScheme() === 'dark' ? Spring.dark : Spring.light;
}
