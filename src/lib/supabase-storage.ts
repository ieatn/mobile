import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import type { SupportedStorage } from '@supabase/supabase-js';

/** No-op storage for Node SSR (expo-router static web render). */
const serverStorage: SupportedStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
};

/** Browser localStorage when `window` exists. */
const webStorage: SupportedStorage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

export function getSupabaseStorage(): SupportedStorage {
  if (Platform.OS === 'web') {
    return typeof window === 'undefined' ? serverStorage : webStorage;
  }
  return AsyncStorage;
}
