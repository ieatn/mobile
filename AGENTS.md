# mobile — greeting app with Supabase auth

## Stack

- **Expo SDK 54** — must stay on 54 for App Store Expo Go compatibility
- **expo-router ~6** — file-based routing under `src/app/`
- **React Native 0.81** / **React 19.1**
- **Supabase** — `@supabase/supabase-js`, email/password + Google OAuth
- Docs: https://docs.expo.dev/versions/v54.0.0/ (read before writing Expo code)

When changing dependencies, run `npx expo install <package>` so versions stay SDK-aligned. Do **not** upgrade to SDK 55 unless the user confirms Expo Go on their device supports it.

## App shape

Two routes, no tab bar. Unauthenticated users are redirected to `/auth`.

| Route | File | Role |
|-------|------|------|
| `/` | `src/app/index.tsx` | Home — large-title greeting + notes CRUD |
| `/auth` | `src/app/auth.tsx` | Auth — sign in, sign up, Google OAuth, sign out |

| File | Role |
|------|------|
| `src/app/_layout.tsx` | `AuthProvider`, navigation theme, `AuthRouteGuard`, `<Slot />` |
| `src/providers/auth-provider.tsx` | Session state via `supabase.auth` |
| `src/lib/supabase.ts` | Supabase client |
| `src/lib/supabase-storage.ts` | Platform storage (AsyncStorage / localStorage / SSR no-op) |
| `src/lib/auth-oauth.ts` | Google OAuth (`signInWithOAuth` + `expo-web-browser`) |

## UI conventions

- **iOS-native, simple** — grouped gray background (`#F2F2F7`), white rounded sections, system fonts, large titles
- **Reuse primitives** — `Screen`, `GroupedSection`, `ThemedText`, `ThemedView`
- **Colors** — `src/constants/spring-theme.ts` (iOS-style palette; name is legacy) + `src/constants/theme.ts`
- **Hooks** — `useSpringPalette()`, `useTheme()`, `useAuth()`
- Home links to Account (`/auth`) in the top-right; no auth chrome on the greeting itself

## Supabase

Env vars (see `.env.example`; `.env` is gitignored):

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

**Dashboard setup** for auth:

1. Enable Google under Authentication → Providers
2. Add redirect URLs: `mobile://**`, `exp://127.0.0.1:8081`, `http://localhost:8081`
3. Optional: disable email confirmation while testing sign-up

**Dev table** `testing_mobile` — open RLS policies for anon/authenticated (sandbox only; not production-safe).

Restart Metro after `.env` changes: `npx expo start -c`.

## Do not add without asking

- Tab navigators (`NativeTabs`, `app-tabs`, bottom bar)
- `AnimatedSplashOverlay` or heavy `react-native-reanimated` usage in `_layout`
- Extra routes beyond `/` and `/auth` (e.g. `explore.tsx`)
- SDK 55-only APIs or packages
- Ornate/decorative UI (gradients, custom display fonts, heavy illustration) unless requested

## Dev commands

```bash
npm install
npx expo start          # phone: scan QR in Expo Go
npx expo start -c       # after .env, dependency, or native issues
npm run web             # browser — no Expo Go version check
npm run lint
```

Fast Refresh applies to most TSX edits; reload (`r` in terminal) if a new route or font fails to appear.

## Project layout

```
src/
  app/              # expo-router screens (index, auth, _layout)
  components/       # Screen, GroupedSection, auth-screen, testing-mobile-crud, themed-*
  constants/        # theme.ts, spring-theme.ts
  hooks/            # use-auth, use-theme, use-spring-palette, use-color-scheme
  lib/              # supabase client, auth-oauth, supabase-storage
  providers/        # auth-provider
  types/            # testing-mobile row types
```

Starter leftovers under `components/` (e.g. `animated-icon`, `ui/collapsible`) are unused — prefer extending existing app components.

## Path alias

`@/` → `src/` (see `tsconfig.json`)
