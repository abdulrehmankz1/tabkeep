# TabKeep

Offline-first expense tracker and personal ledger (khata) for Android and iOS, with on-device receipt scanning.

TabKeep helps you track daily and monthly spending, scan receipts to auto-fill entries using on-device OCR, keep a running khata (lending ledger) with friends and family, and see where your money goes with monthly reports and charts. Everything works fully offline — your data lives on your device, and you're always one tap away from a local backup.

## Features

### Expenses
- Categorized expense tracking (Food, Rent, Bills, Transport, and more) with a color-coded icon per category
- Home dashboard with a donut chart breakdown of monthly spending, today's total, and a recent-activity list
- Full history view, grouped by day
- Manual entry via a numeric keypad, or auto-filled from a scanned receipt

### Receipt scanning
- Point the camera at a receipt (or pick one from your gallery) and on-device OCR extracts the amount, merchant, and date
- A review screen lets you confirm or correct the parsed details before saving
- Runs entirely on-device — no receipt image or data is uploaded anywhere

### People & khata (lending ledger)
- Track money given to and received from friends, with a running balance per person
- Import contacts directly when adding a new person
- Settled vs. outstanding status at a glance

### Reports
- **Overview** — this month's total, daily average, biggest expense, and a khata summary
- **Categories** — spending broken down by category with progress bars
- **Trends** — day-by-day spending for the selected month
- Month-over-month comparison with a spend-up/spend-down trend indicator
- Share any month's report as an image

### Bin
- Deleted expenses and people move to a Bin instead of disappearing immediately
- Restore anything within the retention window, or it's purged automatically after it expires

### Settings & personalization
- **Currency** — switch how every amount in the app is formatted (PKR, USD, EUR, GBP, INR, AED, SAR)
- **Theme** — light, dark, or match system setting, applied consistently across every screen
- **CSV export** — export all expenses to a CSV file and share it anywhere (Drive, email, Files app, etc.)
- **Local backup & restore** — save a full snapshot of your expenses, khata entries, and settings to a file you control, and restore it on this or another device
- **About** — info on the app and the person who built it

### Feel
- Haptic feedback on key interactions (saving, deleting, switching tabs, confirming)
- Subtle entrance and transition animations throughout, tuned to feel calm rather than flashy

## Project Structure

```
app/                    File-based routes (expo-router)
  (auth)/                Onboarding, sign in/up, forgot password
  (tabs)/                Home, People, Reports, Account tab screens
  expense/[id].tsx        Expense detail
  person/[id].tsx          Person detail (khata history)
  add-expense.tsx, add-person.tsx, add-transaction.tsx   Modal entry sheets
  scan-receipt.tsx, receipt-review.tsx                    Camera + OCR review flow
  currency.tsx, theme.tsx, backup.tsx, about.tsx, bin.tsx  Settings screens

src/
  components/            Shared UI (icons, dialogs, pickers, loading/empty/error states)
  store/                 Zustand stores (expenses, people, settings, dialog, auth flow)
  lib/                   Pure logic: money formatting, OCR parsing, CSV/backup export, haptics
  theme/                 Color tokens, spacing, typography, and the useTheme() hook
  data/                  Seed data and static option lists (currencies, mock expenses/people)
  __tests__/              Jest unit tests for the lib/ logic
```

## Tech Stack

- **Expo (TypeScript) + expo-router** — file-based routing, native modules via config plugins
- **Zustand** — lightweight state management for expenses, people, settings, and app flow
- **react-native-ml-kit** (via expo-camera / expo-image-picker) — on-device OCR for receipt scanning
- **react-native-reanimated + expo-haptics** — entrance animations and tactile feedback
- **react-native-gifted-charts** — the spending donut chart on Home
- **expo-file-system + expo-sharing** — writing and sharing CSV export and backup files
- **Jest** — unit tests for formatting, parsing, and export logic

## Getting Started

```bash
npm install
npx expo run:android   # or: npx expo run:ios
```

This project uses native modules (camera, on-device OCR, haptics), so it requires a **development build** — Expo Go is not supported.

## Scripts

```bash
npm run start    # start Metro with dev client
npm run android  # build + run on Android
npm run ios      # build + run on iOS
npm run lint     # run ESLint
npm run test     # run Jest tests
```

## Design notes

- **Offline-first by design** — the app never assumes a network connection. Backup and restore are file-based and user-initiated, not a background cloud sync.
- **Theming** — every screen reads colors through a single `useTheme()` hook rather than hardcoded values, so light/dark/system mode stays consistent everywhere, including the camera-facing receipt scanner (which intentionally stays dark, matching standard camera UI conventions).
- **Money handling** — all amounts are stored as integers in minor currency units (e.g. paisas) to avoid floating-point rounding bugs; currency switching only changes formatting, not the underlying stored value.
