# PeacePath – Expo React Native App

A privacy‑first mobile companion that warns users when blocked contacts are nearby and suggests calmer paths.

## Core Features

- **Phone‑OTP On‑boarding** (Firebase Auth)
- **Contact Matching & Swipe Classification** (`react-native-deck-swiper`) :contentReference[oaicite:2]{index=2}
- **Background Location & Proximity Alerts** (`expo-location`, GeoFireX)
- **Push Notifications** (Expo Notifications)
- **Relationship Management UI & Settings**

## Technical Stack

| Layer           | Choice & Rationale                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Framework       | **Expo SDK (latest)** – instant dev reload, OTA updates                                                                                  |
| Routing         | **Expo Router** – file‑based, mirrors folder hierarchy :contentReference[oaicite:3]{index=3}                                             |
| State           | **Zustand** (simple, hook‑first) :contentReference[oaicite:4]{index=4}  — fall back to Redux‑Toolkit only if persistence/undo require it |
| Styling         | **NativeWind** (Tailwind for RN) :contentReference[oaicite:5]{index=5}                                                                   |
| Back‑End / Auth | Firebase Auth + Firestore                                                                                                                |
| Testing         | Jest + @testing‑library/react‑native • Playwright MCP server (E2E)                                                                       |
| CI/CD           | EAS Build & Submit                                                                                                                       |

## Design Philosophy

- **Mobile‑First Calmness** – dark‑mode‑ready, large touch targets.
- **Minimal Cognitive Load** – one primary action per screen.
- **Privacy By Default** – local processing whenever feasible (contact hash, on‑device geofence).
- **Battery Friendly** – adaptive location polling intervals.

## Standards

- **Components:** Functional React components **only** – never class components.
- **TypeScript everywhere**; prefer `interface` over `type`.
- **Exports:** Always named exports; no default.
- **Functions:** Declare with `function fnName()`; arrow funcs only for inline callbacks.
- **Styling:** NativeWind utility classes; never inline styles or magic HEX values.
- **Comments:** Explain _why_, not _what_.
- **Tests:** Keep `MyThing.tsx` & `MyThing.spec.tsx` side‑by‑side.
- **Dev Server:** A Metro server is already running via `expo start`. **Never** spawn another.
- **Accessibility:** All touchables ≥ 44 × 44 dp; add `accessibilityLabel` & `role`.
- **File Names:** PascalCase for components, kebab‑case for folders.

## Project Structure

app/ # File‑based routes (Expo Router)
│ ├─ (tabs)/ # Route groups (no URL change)
│ │ ├─ index.tsx # Home tab ➜ "/"
│ │ └─ settings.tsx # "/settings"
│ ├─ auth/ # Auth flow stack
│ │ └─ login.tsx
│ ├─ \_layout.tsx # Root router layout
│ └─ +not-found.tsx # 404 screen
src/
│ ├─ components/ # Reusable UI
│ │ ├─ ui/ # Base primitives (Button, Card…)
│ │ └─ features/ # Feature‑scoped pieces
│ ├─ stores/ # Zustand stores
│ ├─ hooks/ # Custom hooks
│ ├─ services/ # Firebase, location, contacts
│ ├─ utils/ # Pure helpers
│ └─ assets/ # Fonts, images
test/
│ └─ e2e/ # Playwright specs
global.css # Tailwind tokens for NativeWind
metro.config.js # NativeWind preset

markdown
Copy
Edit

## Common Commands

| Use‑case                    | Command                                       |
| --------------------------- | --------------------------------------------- |
| Start dev server            | `pnpm expo start`                             |
| Run iOS / Android simulator | `pnpm expo run:ios` • `pnpm expo run:android` |
| Build for stores            | `pnpm eas build --platform all`               |
| Unit tests                  | `pnpm jest`                                   |
| E2E tests                   | `pnpm playwright test`                        |
| Lint & type‑check           | `pnpm turbo lint`  • `pnpm tsc --noEmit`      |

## Development Workflow

1. **Scope** – create a task card, include tests.
2. **Code** – follow structure & standards above.
3. **Test** – unit + Playwright happy‑path and edge cases.
4. **Review** – self‑review diff; squash dead code.
5. **PR** – link to PRD requirement & add screenshot/video of UI.
6. **Merge** – CI must be green.

## Testing Workflow

- **Critical logic first**, then UI states.
- Use `jest.useFakeTimers()` for polling/interval tests.
- Snapshot tests allowed only for static DS components.
- **Playwright MCP Server** steps: open screen → simulate swipe → assert toast → check JS console.

## Research & Docs

- Never hallucinate URLs; check `llms.txt` first if available.
- Prefer official docs: Expo, Firebase, NativeWind, Zustand.
- Validate sample code in snack.expo.dev before merging.

## MCP Servers

- **Playwright** – already configured for Expo web target. See `/test/e2e/.
