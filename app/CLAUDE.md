# Screens & Navigation with Expo Router

Expo Router maps file paths directly to routes, similar to Next.js and Nuxt pages :contentReference[oaicite:6]{index=6}.

## Conventions

| Goal                  | Rule / Example                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| **No unnamed routes** | Use segments not `index.tsx`; prefer `(home)/index.tsx` so route name is `(home)` not `index`.     |
| **Explicit params**   | `[contactUid].tsx` over `[id].tsx`.                                                                |
| **Optional params**   | `[[tab]].tsx` – matches `/`, `/blocked`, `/neutral`.                                               |
| **Catch‑all**         | `[...404].tsx` or `+not-found.tsx`.                                                                |
| **Route Groups**      | `(auth)/login.tsx` ➜ URL `/login`, isolation for layout.                                           |
| **Typed Links**       | `router.push('/blocked')` OR `router.push({ pathname: '/[contactUid]', params: { contactUid } })`. |
| **SEO / Shell meta**  | Use `export const meta = { title: 'Swipe', description: ... }` where needed for web build.         |

## File Examples

app/
├─ (tabs)/ # Tab group
│ ├─ \_layout.tsx # Defines Tab.Navigator
│ ├─ index.tsx # "/" Home dashboard
│ ├─ blocked.tsx # "/blocked"
│ └─ neutral.tsx # "/neutral"
├─ auth/
│ ├─ \_layout.tsx # Stack for auth flow
│ └─ login.tsx
└─ +not-found.tsx # 404

pgsql
Copy
Edit

## Screen Template

```tsx
import { Link, useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function BlockedScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-semibold text-primary-600">
        Blocked Contacts
      </Text>
      <Link href="/neutral" className="mt-4 text-link">
        See neutral list →
      </Link>
    </View>
  );
}
```

## Navigation Tips

- Use file groups for shared headers or tab bars.

- Deep‑link scheme auto‑generated (exp://peacepath).

- For modal stacks, prefix folder with +. Example modal/swipe-help.tsx.

- Avoid imperative navigation inside effects; prefer event‑driven state → effect.

## Testing Navigation

- With Playwright: await page.goto('/').

- Tap element getByText('Blocked').

- Assert expect(page.url()).toContain('/blocked').
