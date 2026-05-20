# mobile — warm greeting app

## Stack

- **Expo SDK 54** — must stay on 54 for App Store Expo Go compatibility
- **expo-router ~6** — file-based routing under `src/app/`
- **React Native 0.81** / **React 19.1**
- Docs: https://docs.expo.dev/versions/v54.0.0/ (read before writing Expo code)

When changing dependencies, run `npx expo install <package>` so versions stay SDK-aligned. Do **not** upgrade to SDK 55 unless the user confirms Expo Go on their device supports it.

## App shape

Single-screen app only. No tab bar, no navbar, no extra routes.

| File | Role |
|------|------|
| `src/app/index.tsx` | Home — time-based greeting + “Glad you're here.” |
| `src/app/_layout.tsx` | Root layout — `ThemeProvider` + `<Slot />` (not `Stack` or tabs) |

## UI conventions

- **Minimal** — greeting + subtitle only; no lists, cards, or starter-template clutter unless asked
- **Warm palette** — light `#FFF8F0`, dark `#1C1510` (defined in `index.tsx`)
- **Centered** — `SafeAreaView`, full-screen, no scroll needed
- Reuse `ThemedText`, `ThemedView`, `Spacing` / `MaxContentWidth` from `@/constants/theme`

## Do not add without asking

- Tab navigators (`NativeTabs`, `app-tabs`, bottom bar)
- `AnimatedSplashOverlay` or heavy `react-native-reanimated` usage in `_layout`
- Extra screens (e.g. `explore.tsx`)
- SDK 55-only APIs or packages

## Dev commands

```bash
npm install
npx expo start          # phone: scan QR in Expo Go
npx expo start -c       # after dependency or native issues
npm run web             # Chrome — no Expo Go version check
```

## Project layout

```
src/
  app/           # expo-router screens
  components/    # shared UI (many are unused starter leftovers)
  constants/     # theme colors, spacing
  hooks/         # useColorScheme, useTheme
```

## Path alias

`@/` → `src/` (see `tsconfig.json`)
