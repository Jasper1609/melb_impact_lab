# Tapestry — Mobile App (Frontend)

## Stack

Expo SDK 54, React Native 0.81, React 19, TypeScript 5.9, Expo Router v6 (file-based routing).

## Commands

```bash
npm install
npx expo start           # dev server (iOS, Android, Web)
npx expo start --web     # web only
npx ultracite            # lint + format
```

## Conventions

- All data is hardcoded in `constants/plan-data.ts`. No backend API calls.
- Canonical styles: import `colors`, `fonts`, and `shared` from `constants/onboarding-styles.ts`.
- Design system reference: `DESIGN.md` (ElevenLabs-inspired visual spec with colors, typography, components).
- File-based routing via Expo Router. Screens live in `app/`.
- `NoiseGradient` component requires `assets/images/noise-texture.png`.

## Gotchas

- This is Expo SDK **54**, not 56. Check the v54 docs at https://docs.expo.dev/versions/v54.0.0/.
- Platform fonts use fallback chains — test on both iOS and Android for rendering differences.
