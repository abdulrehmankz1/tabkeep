# Expense & Khata Tracker — Master Project Plan

**App name:** TabKeep *(finalized — "keep tabs on spending" + "put it on my tab" = expenses + khata in one name)*
**Tagline:** *TabKeep — keep tabs on every rupee.*
**Android package name:** `com.yourname.tabkeep` *(replace `yourname`; cannot be changed after Play Store publish)*
**Platform:** Android-first (React Native / Expo), iOS later
**Author:** Solo developer project
**Goal:** Portfolio-grade, production-quality app targeting international (US/EU/Australia) and local recruiters
**Total budget required for development: Rs. 0** (publishing deferred)

---

## 1. What This App Is

An **offline-first expense tracker + personal ledger (khata)** with AI-powered receipt scanning.

One-line pitch for the README:

> *Track daily and monthly expenses, scan receipts to auto-create expenses using on-device ML, manage personal lending (udhaar) with friends, and get monthly reports with charts — all working fully offline, syncing to the cloud when online.*

### Core Features

1. **Manual expense tracking** — daily (food, transport) and monthly (rent, bills) with categories
2. **Receipt/slip scanning (OCR)** — photo → amount, date, merchant auto-extracted on-device, user confirms before save
3. **People / Khata (ledger)** — add contacts, record "Maine Diye" / "Maine Liye", auto-calculated running balance per person
4. **Monthly reports** — charts, category breakdown, month-over-month trends, udhaar summary, month-end notification
5. **Offline-first** — everything works without internet; syncs to Supabase when connected
6. **Auth** — email/password + Google sign-in; app remains fully usable offline after login

### What Expenses and Khata Do NOT Mix

Money given as udhaar is **not counted in expense totals** (it is expected back). Reports show them as separate sections so monthly spending numbers stay honest.

---

## 2. Design System / Theme

### Color Palette — "Black & White + Money Colors"

| Token | Hex (Dark) | Hex (Light) | Used For |
|---|---|---|---|
| `bg-primary` | `#0A0A0A` | `#FFFFFF` | Screen background |
| `bg-surface` | `#161616` | `#F5F5F5` | Cards, sheets, inputs |
| `bg-elevated` | `#222222` | `#FFFFFF` | Modals, FAB background |
| `text-primary` | `#FFFFFF` | `#0A0A0A` | Headings, amounts |
| `text-secondary` | `#A3A3A3` | `#525252` | Labels, hints, dates |
| `border` | `#2A2A2A` | `#E5E5E5` | Dividers, card borders |
| `money-in` | `#22C55E` | `#16A34A` | Money received, positive balance ("milne hain") |
| `money-out` | `#EF4444` | `#DC2626` | Money spent/given, negative balance ("dene hain") |
| `accent` | `#FFFFFF` | `#0A0A0A` | Primary buttons, FAB (monochrome accent = clean B&W identity) |
| `warning` | `#F59E0B` | `#D97706` | Pending sync, low-confidence OCR fields |
| `info` | `#3B82F6` | `#2563EB` | Sync status, links, informational badges |

**Rules:**
- Base identity is **strictly black & white** — backgrounds, text, buttons, icons are monochrome.
- **Green and red are reserved for money semantics only.** Never use green/red for decoration. This makes every green/red pixel meaningful — the user's eye learns "color = money direction."
- Category chips may use muted colors from a fixed palette (only inside chips/icons, never full surfaces): `#8B5CF6` purple, `#EC4899` pink, `#14B8A6` teal, `#F97316` orange — kept low-saturation on dark surfaces.
- Charts: use category colors; totals and axis stay monochrome.
- Dark mode is the **default and primary** design target; light mode derived from tokens. Both ship in Phase 1.

### Typography

- Font: **Inter** (free, Google Fonts via `expo-font`)
- Amounts: Inter **Bold**, tabular numbers (`fontVariant: ['tabular-nums']` so digits align in lists)
- Scale: 32 (hero amounts) / 24 (screen titles) / 17 (body) / 15 (list items) / 13 (captions)

### Spacing & Components

- **8pt grid** — all spacing in multiples of 8 (4 allowed for tight cases)
- Corner radius: 16 (cards, sheets), 12 (buttons, inputs), full (chips, avatars)
- Touch targets: minimum 44×44
- Avatars: initials on colored circles (deterministic color from name hash — free, no photos needed)
- Every screen designed with **empty, loading, and error states** — not just the happy path

### Design Workflow

Design all Phase 1 screens in **Figma (free tier) before writing code**. The Figma file itself is a portfolio asset for UI/UX credibility.

---

## 3. Tech Stack (All Free)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Expo SDK (latest) + TypeScript** | Industry standard; TS is non-negotiable for portfolio |
| Routing | **expo-router** | File-based, modern |
| Local DB | **WatermelonDB** | Built for offline-first sync; reactive observables; lazy loading; the built-in `synchronize()` protocol |
| Backend | **Supabase free tier** | Postgres + Auth + Storage; 500MB DB, 1GB storage, 50k MAU — far more than needed |
| Auth | **Supabase Auth** | Email/password + Google sign-in |
| OCR | **@react-native-ml-kit/text-recognition** | On-device, free, unlimited, works offline — no Python, no server |
| Image preprocessing | **expo-image-manipulator** | Contrast/grayscale/resize before OCR (+20–30% accuracy on thermal receipts) |
| Camera / Gallery | **expo-camera, expo-image-picker** | Receipt capture |
| File storage (local) | **expo-file-system** | Receipt images stored locally first |
| Cloud image storage | **Supabase Storage** | Background upload queue when online |
| UI state | **Zustand** | Only for UI state (theme, filters); data state lives in WatermelonDB observables |
| Charts | **react-native-gifted-charts** (or Victory Native XL) | Free, animated |
| Animations | **react-native-reanimated** | Micro-interactions, chart entry |
| Forms/validation | **react-hook-form + zod** | Type-safe validation |
| Notifications | **expo-notifications (local only)** | Month-end report reminder — no server needed |
| Contacts import | **expo-contacts** | Optional import for People; permission asked in-context |
| Share/export | **react-native-view-shot, expo-sharing** | Report-as-image, CSV export |
| Testing | **Jest + React Native Testing Library** | Unit + component tests |
| CI | **GitHub Actions** | Lint + test on every push (free on public repo) |
| Builds | **Local Android Studio** (unlimited, free) or **EAS Build free tier** (~30/month, slow queue) | Dev build required from Day 1 (WatermelonDB + ML Kit are native modules — Expo Go will not work) |
| Distribution (pre-store) | **GitHub Releases (APK)** | Free; recruiters can download directly |
| Design | **Figma free tier** | Screens before code |

**Money rule:** store all amounts as **integers in paisas/cents** (Rs. 150.50 → `15050`). Never floats — avoids rounding bugs.

---

## 4. Database Schema (WatermelonDB local ↔ Supabase Postgres)

Every table carries `updated_at` and `deleted_at` (soft-delete tombstones) — required by the sync engine. Supabase tables protected with **Row Level Security (RLS)**: each user reads/writes only their own rows.

```
categories
├── id, user_id
├── name            "Food", "Rent", "Bills", ...
├── icon, color
├── type            'daily' | 'monthly'
└── updated_at, deleted_at

expenses
├── id, user_id
├── amount          integer (paisas)
├── category_id     → categories
├── note            optional
├── date            ISO string
├── source          'manual' | 'ocr'
├── receipt_image   local path (nullable)
├── receipt_remote  Supabase Storage URL (nullable)
├── merchant        nullable (from OCR)
└── created_at, updated_at, deleted_at

people
├── id, user_id
├── name            required
├── phone           optional
└── created_at, updated_at, deleted_at

transactions            (khata entries)
├── id, user_id
├── person_id       → people
├── amount          integer (paisas)
├── direction       'gave' | 'received'
├── note            optional
├── transaction_date  user-editable (default: now)
└── created_at, updated_at, deleted_at

settings (key-value): currency, theme, month_start_day
```

**Balance is never stored** — always computed:
`balance = SUM(gave) − SUM(received)`
Positive → green "aapko milne hain". Negative → red "aapne dene hain". Zero → "✓ Settled" badge.
Example: gave 5,000, received 3,000 → **+2,000 milne hain**, with both entries preserved in history.

---

## 5. All Screens (16 Total)

| # | Screen | Phase | Notes |
|---|---|---|---|
| 1 | Onboarding (3 slides) | 1 | What the app does, scan feature, privacy pitch |
| 2 | Sign Up | 1 | Email/password + Google |
| 3 | Sign In | 1 | + forgot password |
| 4 | Home / Dashboard | 1 | Month total, category breakdown, today, recent 5, FAB |
| 5 | Add Expense (bottom sheet) | 1 | Custom numeric keypad, category grid, ≤3 taps to save |
| 6 | History | 1 | Date-grouped, month selector, filters, swipe-delete + undo |
| 7 | Categories | 1 | CRUD, 8–10 pre-seeded defaults |
| 8 | People (tab) | 1 | Contact list, color-coded net balances, summary card, search |
| 9 | Person Detail | 1 | Balance card, "Maine Diye"/"Maine Liye" buttons, transaction timeline, Settle shortcut |
| 10 | Add Person (bottom sheet) | 1 | Name required, phone optional, contacts import |
| 11 | Account / Settings (tab) | 1 | Profile, currency, theme, logout |
| 12 | Sync Status | 2 | Synced/pending counts, last sync, offline indicator |
| 13 | Reports (tab) | 3 | Overview, Categories (pie), Trends (bar/line), **Udhaar section** |
| 14 | Monthly Report Detail | 3 | Month-end notification → full report; share-as-image |
| 15 | Scan Receipt | 4 | Camera + frame guide + gallery pick + preview/retake |
| 16 | Review & Confirm OCR | 4 | Editable extracted fields, receipt thumbnail, confirm to save |

*(Add Transaction for khata is a bottom sheet inside Person Detail, reusing the expense keypad component.)*

### Tab Navigation (4 tabs + FAB)

```
[ Home ]   [ People ]   [ Reports ]   [ Account ]
                 (+ FAB → Add Expense / Scan Receipt)
```

---

## 6. The Five Phases

### PHASE 1 — Foundation + Auth + Expenses + Khata (5–6 weeks)

**Goal:** a complete, usable app with manual entry and the full khata system. After this phase the app is already demo-able.

**Screens:** 1–11 (see table)

**Work:**
- Project setup: Expo + TypeScript + expo-router + ESLint + Prettier + conventional commits
- **Dev build from Day 1** (local Android Studio preferred; EAS free tier fallback)
- Figma designs for all Phase 1 screens **before coding**
- Design tokens file (colors, spacing, typography from Section 2); dark mode default + light mode
- Supabase project: Auth (email + Google), tables, **RLS policies**
- WatermelonDB: models, schema, decorators, seeded default categories
- Auth UX: after first login the session is cached — **app never locks the user out offline**
- Custom numeric keypad component (reused by expenses and khata)
- Khata balance computation + settled state
- Empty states on every screen; swipe-delete with undo toast (no data lost by accident)
- 10–15 unit tests (amount formatting, date grouping, balance calculation)
- GitHub Actions: lint + test on push

**Definition of done:** a friend can install the APK, sign up, track a week of expenses and udhaar without hitting a dead end.

---

### PHASE 2 — Sync Engine (2–3 weeks)

**Goal:** true offline-first sync. This is the portfolio crown jewel.

**Screens:** 12 (Sync Status)

**Work:**
- Supabase **`pull` / `push` Postgres functions** implementing WatermelonDB's sync protocol (server side is hand-written — WatermelonDB only ships the client side)
- Wire `synchronize()`: on app open, after saves (when online), and pull-to-refresh
- Conflict resolution: **last-write-wins** via `updated_at` (simple, defensible — justify in README)
- Soft deletes / tombstones so deletions propagate correctly
- Offline indicator in the UI; pending-changes counter
- Sync logic tests + **sync architecture diagram for the README**

**Honest note:** this is the hardest conceptual phase. Expect debugging. It is also the single most impressive thing in the project for senior reviewers.

---

### PHASE 3 — Reports & Charts (2 weeks)

**Goal:** turn data into insight.

**Screens:** 13, 14

**Work:**
- Aggregation queries: month totals, category breakdown, daily trend, 6-month comparison
- **Udhaar report section:** given this month, received back, total outstanding, top 3 people, trend — kept separate from expense totals
- Pie/donut + bar + line charts with Reanimated entry animations
- Month-over-month comparison logic (+ tests)
- **Local notification** at month end → Monthly Report Detail
- Share-report-as-image (view-shot + expo-sharing)

---

### PHASE 4 — Receipt OCR (3–4 weeks)

**Goal:** the hero feature. Photo → expense, on-device, offline.

**Screens:** 15, 16

**Pipeline:**
```
Photo → preprocess (grayscale, contrast, resize)
      → ML Kit on-device OCR → text blocks + positions
      → TypeScript parsing engine → amount, date, merchant, category suggestion
      → Review & Confirm screen → user verifies → expense saved (source: 'ocr')
      → receipt image saved locally → background queue uploads to Supabase Storage when online
```

**Parsing engine (the most interesting code in the app):**
- Amount: largest number near keywords TOTAL / GRAND TOTAL / AMOUNT; regex for `Rs. 1,234.00`, `$12.34`
- Date: multi-format regex
- Merchant: top text block heuristic
- Category suggestion: keyword map (KFC/McDonald's → Food; PSO/Shell → Transport; K-Electric/SNGPL → Bills)

**Blur / bad-photo defense (3 layers):**
1. **Before capture:** frame guide overlay + lighting hint; capture preview with Retake/Continue
2. **After OCR:** quality heuristics — too few text blocks (< ~5), no valid amount pattern found, or garbage-character ratio too high → "Photo saaf nahi lag rahi" dialog with Retake / Enter Manually. (ML Kit never errors on blur — it returns wrong text silently, so these checks are ours.)
3. **Review screen:** user always confirms/edits before save. AI suggests, user decides. The app never silently saves a wrong amount.

**Deliberately deferred:** OpenCV Laplacian blur-scoring (heavy native dep; heuristics cover it) and paid LLM vision APIs (accuracy upgrade for a future version). Both trade-offs documented in README — that reasoning itself is a portfolio asset.

- Unit tests: parsing engine against 15–20 sample receipt texts (interview-ready test suite)
- Expected honest accuracy on Pakistani thermal receipts: **~60–80%** — which is why the Review screen is core UX, not a workaround

---

### PHASE 5 — Polish + Export + Release (2 weeks)

**Goal:** turn a project into a product.

**Work:**
- Loading/error/empty state audit on every screen
- Reanimated micro-interactions (FAB, list items, haptics on save)
- Accessibility pass: labels, 44px targets, contrast check on both themes
- CSV export + JSON backup/restore (expo-sharing)
- App icon + splash (designed in Figma)
- **README final:** demo GIF (scan → expense appearing — the 5-second recruiter hook), sync architecture diagram, OCR pipeline diagram, tech-decision write-ups ("Why WatermelonDB", "Why on-device OCR"), screenshots, setup guide, Download-APK button
- **APK on GitHub Releases** (free distribution)
- 1–2 technical blog posts on dev.to: *"Offline-first expense tracker: WatermelonDB + Supabase custom sync"* and/or *"Parsing messy receipts with on-device ML Kit in React Native"*
- Play Store upload: **deferred** until the one-time $25 fee is convenient

---

## 7. Timeline (Honest, Part-Time ~2–3 hrs/day)

| Phase | Duration |
|---|---|
| 1 — Foundation + Auth + Expenses + Khata | 5–6 weeks |
| 2 — Sync Engine | 2–3 weeks |
| 3 — Reports & Charts | 2 weeks |
| 4 — Receipt OCR | 3–4 weeks |
| 5 — Polish + Release | 2 weeks |
| **Total** | **~4.5 – 6.5 months** |

Every phase ends with a working, demo-able app — progress is always visible on GitHub.

---

## 8. Cost Breakdown

| Item | Cost |
|---|---|
| Entire development stack (Expo, WatermelonDB, Supabase free tier, ML Kit, all libraries, Figma, GitHub, CI, builds, APK distribution) | **Rs. 0** |
| Play Store publishing (deferred) | $25 one-time |
| App Store / iOS (skipped for now) | $99/year |

**Two free-tier cautions:**
1. Supabase pauses the project after ~1 week of inactivity (data safe; 1-click restore) — check before demos/interviews.
2. Google sign-in needs a free Google Cloud OAuth client (SHA-1 key setup — fiddly but free).

---

## 9. Portfolio Checklist (International Recruiter Lens)

- [ ] README in professional English: pitch, demo GIF, architecture diagrams, tech decisions, screenshots, APK link
- [ ] Clean conventional-commit history (`feat:`, `fix:`) — no "asdf" commits
- [ ] CI badge (GitHub Actions) visible in README
- [ ] Test suite: balance calc, parsing engine, sync logic, formatting
- [ ] TypeScript strict mode throughout
- [ ] Figma design file linked (UI/UX credibility)
- [ ] 1–2 dev.to technical posts linked (communication proof — the biggest remote-hiring filter)
- [ ] Privacy angle in onboarding + README: on-device OCR, local-first data (GDPR-minded framing for EU/US)
- [ ] LinkedIn project case study: problem → approach → decisions → result

---

## 10. Guiding Principles (Decisions Already Made)

1. **Offline-first is the identity** — nothing breaks without internet; sync is an enhancement.
2. **Khata ≠ expenses** — udhaar never pollutes spending totals.
3. **Balances are computed, never stored.**
4. **AI suggests, user decides** — OCR always passes through Review & Confirm.
5. **Green/red mean money only** — the B&W theme makes color = meaning.
6. **Amounts are integers (paisas).**
7. **Every phase ships something usable** — no half-built app sitting for months.
8. **Reuse components** — one numeric keypad serves expenses and khata.
9. **Document trade-offs in the README** — the reasoning is worth as much as the code.
