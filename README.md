# TabKeep

Offline-first expense tracker + personal ledger (khata) with AI-powered receipt scanning.

Track daily and monthly expenses, scan receipts to auto-create expenses using on-device ML, manage personal lending (udhaar) with friends, and get monthly reports with charts — all working fully offline, syncing to the cloud when online.

## Tech Stack

- Expo (TypeScript) + expo-router
- WatermelonDB (offline-first local database)
- Supabase (Auth + Postgres + Storage)
- ML Kit (on-device OCR)
- Zustand, React Hook Form + Zod
- react-native-reanimated, react-native-gifted-charts

## Getting Started

```bash
npm install
cp .env.example .env   # fill in Supabase project URL + anon key
npx expo run:android   # or: npx expo run:ios
```

This project uses native modules (WatermelonDB, ML Kit), so it requires a **development build** — Expo Go is not supported.

## Scripts

```bash
npm run start   # start Metro with dev client
npm run android  # build + run on Android
npm run ios      # build + run on iOS
npm run lint     # run ESLint
npm run test     # run Jest tests
```
