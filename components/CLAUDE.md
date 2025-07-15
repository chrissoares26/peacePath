# React Native Components – Best Practices

## Naming

- Files **PascalCase** (`UserAvatar.tsx`); component name mirrors file.
- Compose names most‑general → most‑specific (`SwipeCardContact`).
- Folder‑level index barrels allowed (`export * from './Button'`).

## Props & Typing

```ts
export interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary';
  onPress: () => void;
}
export function Button({ title, variant = 'primary', onPress }: ButtonProps) {
  ...
}
```

- Avoid React.FC – annotate props explicitly.

- Destructure props right in signature; set defaults there.

## Events

CamelCase prop, e.g. onSwipeLeft.

Return only one value per handler. If multiple, pass an object.

## Styling

- Use NativeWind utilities: <View className="p-4 bg-primary-600 rounded-2xl" />.

- Do not mix inline style={{}} unless dynamic & unavoidable.

- Never hard‑code colors; rely on Tailwind palette tokens.

## Performance

- Memoise with React.memo only after measuring.

- Use useCallback for handlers passed to child lists.

- Heavy lists → FlashList or RecyclerListView.

## Accessibility

- All interactive components expose accessibilityRole & accessibilityLabel.

- Hit‑slop ≥ 10 dp around small icons.

## Tests

- colocate ComponentName.spec.tsx.

- Write tests for: render, states, a11y roles, events.

```

```
