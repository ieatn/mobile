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
| `/` | `src/app/index.tsx` | Home — greeting, AI quote + **New quote**, notes CRUD |
| `/auth` | `src/app/auth.tsx` | Auth — sign in, sign up, Google OAuth, sign out |

| File | Role |
|------|------|
| `src/app/_layout.tsx` | `AuthProvider`, navigation theme, `AuthRouteGuard`, `<Slot />` |
| `src/providers/auth-provider.tsx` | Session state via `supabase.auth` |
| `src/lib/supabase.ts` | Supabase client |
| `src/lib/supabase-storage.ts` | Platform storage (AsyncStorage / localStorage / SSR no-op) |
| `src/lib/auth-oauth.ts` | Google OAuth (`signInWithOAuth` + `expo-web-browser`) |
| `src/lib/ai-notes.ts` | Invokes Edge Function `ai-notes` (historical quote line) |
| `supabase/functions/ai-notes/` | Edge Function: `gemini-2.5-flash-lite` quote (philosophy, finance, etc.) |

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

### AI quotes (home subtitle + “New quote”)

The app does **not** call Gemini from the phone. It calls a **custom Edge Function** named `ai-notes` (source: `supabase/functions/ai-notes/index.ts`). That function runs on Supabase, reads `GEMINI_API_KEY` from Supabase secrets, and returns one quote (`gemini-2.5-flash-lite`).

#### Why you can’t put `GEMINI_API_KEY` in local `.env` for Expo

Expo/React Native apps are installed on the user’s device. Anything the **app binary uses** to call Gemini can be extracted (decompile, proxy traffic, read bundled JS). So a Gemini key in the mobile app is effectively **public** — anyone could steal it and charge your Google account.

| Where the key lives | Who can see it | OK for Gemini? |
|---------------------|----------------|----------------|
| `EXPO_PUBLIC_*` in `.env` | Bundled into the app → public | **No** |
| `GEMINI_API_KEY` in `.env` (no `EXPO_PUBLIC_`) | Not auto-exposed to JS, but useless unless you add client code that reads it — and that code would still ship to the device | **No** (don’t wire it in the app) |
| `supabase secrets set GEMINI_API_KEY` | Only Supabase servers (Edge Function runtime) | **Yes** |

**Safe pattern:** phone → Supabase Edge Function (server) → Gemini. The phone never holds the Google key.

Local `.env` is only for what the **Expo client** needs: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Those are designed to be public; auth + RLS protect your data.

#### Why `supabase login` / CLI at all?

`supabase login` is **not** Gemini and **not** your app users logging in. It proves **you** (the developer) to Supabase so the CLI can:

- upload the function (`functions deploy`)
- set project secrets (`secrets set`)

Without login, the CLI has no access token → errors like “Access token not provided.” Your end users never run the CLI; they only sign into the app via Supabase Auth.

#### Why both secret **and** deploy?

| Piece | Analogy |
|-------|---------|
| **Deploy** | Puts the recipe (`index.ts`) on Supabase’s kitchen |
| **Secret** | Gives the kitchen the Gemini “ingredient” (API key) |

Both are required for live AI quotes. See table below.

**You need both** — they do different jobs:

| Step | Command / place | What it does | Without it |
|------|-----------------|--------------|------------|
| **1. Secret** | `supabase secrets set GEMINI_API_KEY=...` | Stores the Google API key on Supabase for the function to use | Function runs but Gemini calls fail → app shows fallbacks only |
| **2. Deploy** | `supabase functions deploy ai-notes` | Uploads `index.ts` so `ai-notes` exists in the cloud | App invokes a missing function → fallbacks only |

`GEMINI_API_KEY` in local `.env` is **not used** by the Expo app (only `EXPO_PUBLIC_*` vars are). Do not put the Gemini key in the client.

**One-time setup checklist** (project ref `pahjwgiuvjmqhutwnblx`):

```bash
brew install supabase/tap/supabase   # if `supabase` not found
supabase login
cd /path/to/mobile
supabase link --project-ref pahjwgiuvjmqhutwnblx
supabase secrets set GEMINI_API_KEY=your_google_ai_studio_key
supabase functions deploy ai-notes
```

Verify in [Supabase Dashboard](https://supabase.com/dashboard/project/pahjwgiuvjmqhutwnblx) → **Edge Functions** → `ai-notes` is listed.

**When to run again:**

- Changed `supabase/functions/ai-notes/index.ts` → **redeploy** (`supabase functions deploy ai-notes`)
- Rotated Gemini key → **secrets set** again (no redeploy required unless code changed)
- Quotes work in app but look like Seneca/Buffett only → usually missing secret **or** missing deploy

**App flow:** `src/app/index.tsx` → `useAiGreeting` → `src/lib/ai-notes.ts` → `supabase.functions.invoke('ai-notes')` → quote under “Good morning”; **New quote** sends a new `seed`. Offline/errors → `src/constants/fallback-quotes.ts`.

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
  constants/        # theme.ts, spring-theme.ts, fallback-quotes.ts
  hooks/            # use-auth, use-ai-greeting, use-theme, use-spring-palette, use-color-scheme
  lib/              # supabase client, auth-oauth, ai-notes, supabase-storage
  providers/        # auth-provider
  types/            # testing-mobile row types
```

Starter leftovers under `components/` (e.g. `animated-icon`, `ui/collapsible`) are unused — prefer extending existing app components.

## Path alias

`@/` → `src/` (see `tsconfig.json`)
