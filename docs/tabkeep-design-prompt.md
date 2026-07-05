# Design Prompt — Expense & Khata Tracker (TabKeep)

**How to use this file:** Copy everything below the line into Claude Design (or any AI design tool / Figma AI plugin). For best results, generate in this order: first ask for the **design system / style guide**, then generate screens **one section at a time** (Section 6 groups them). Pasting everything at once works too, but section-by-section gives you more control and better quality.

---

## THE PROMPT (copy from here)

You are designing a mobile app (Android-first, 390×844 baseline frame) called **TabKeep** — an offline-first expense tracker + personal lending ledger (khata) with AI receipt scanning. Design a complete, production-grade UI/UX system and all screens. Follow every rule below exactly.

### 1. Brand & Design Personality

- **App name:** TabKeep. **Tagline:** "Keep tabs on every rupee." (usable on onboarding slide 1 and marketing assets — but NOT on the splash screen)

- **Identity: strict black & white.** Backgrounds, text, buttons, icons, and navigation are monochrome. The app should feel premium, calm, and focused — like a well-made banking app, not a colorful gamified tracker.
- **Color is reserved for meaning:** green appears ONLY when money comes in / is owed to the user; red appears ONLY when money goes out / is owed by the user. Never use green or red decoratively. Every colored pixel must mean money direction.
- **Dark mode is the default and primary theme.** Design dark-first; light mode is derived from the same tokens.
- Tone: trustworthy, precise, effortless. Numbers are the heroes of every screen.

### 2. Color Tokens

Dark theme (primary):
- `bg-primary` #0A0A0A (screen background)
- `bg-surface` #161616 (cards, bottom sheets, inputs)
- `bg-elevated` #222222 (modals, FAB)
- `text-primary` #FFFFFF
- `text-secondary` #A3A3A3
- `border` #2A2A2A (1px dividers, card outlines)
- `money-in` #22C55E (received, positive balance)
- `money-out` #EF4444 (spent, given, negative balance)
- `accent` #FFFFFF (primary buttons: white fill, black text)
- `warning` #F59E0B (pending sync, low-confidence OCR fields)
- `info` #3B82F6 (sync status, links)

Light theme: bg #FFFFFF, surface #F5F5F5, text #0A0A0A, secondary #525252, border #E5E5E5, money-in #16A34A, money-out #DC2626, accent = black fill with white text.

Category chip palette (used ONLY inside small chips/icons, never as surfaces): #8B5CF6, #EC4899, #14B8A6, #F97316 — low visual weight on dark backgrounds.

### 3. Typography

- Font: **Inter**
- Hero amounts: 32/Bold, tabular numbers
- Screen titles: 24/SemiBold
- Body: 17/Regular
- List items: 15/Regular, amounts in list rows 15/SemiBold tabular
- Captions, dates, labels: 13/Regular in `text-secondary`
- Currency format: "Rs. 12,345" (support $/€ formatting in Settings)

### 4. Layout, Spacing, Components

- **8pt grid** for all spacing; 16px screen side padding
- Corner radius: 16 (cards, sheets), 12 (buttons, inputs), full (chips, avatars)
- Minimum touch target 44×44
- Buttons: primary = white fill/black text (dark theme), secondary = 1px border transparent fill, destructive = red text only (no red fills except money semantics)
- Avatars: initials on colored circles (deterministic color per name)
- Bottom sheets (not full modals) for all quick actions: add expense, add transaction, add person
- Bottom tab bar, 4 tabs with icons + labels: **Home, People, Reports, Account**. A floating action button (FAB, white circle with black + icon) sits above the tab bar on Home; long-press or expanded FAB reveals two actions: "Add Expense" and "Scan Receipt"
- Every screen must include designs for **empty state, loading state, and error state** — not just the happy path. Empty states: simple monochrome illustration or icon + one-line explanation + one clear CTA button

### 5. Signature Component — Numeric Keypad

A custom calculator-style numeric keypad used in both Add Expense and Add Khata Transaction sheets: large 4×3 grid of keys (1–9, 0, decimal, backspace), amount displayed huge (32/Bold) above the keypad, monochrome keys on `bg-surface` with subtle pressed state. This is the app's signature interaction — make it beautiful.

### 6. Screens to Design (16)

**Group A — Onboarding & Auth**
1. **Onboarding (3 slides):** slide 1 "Track every rupee" (expense concept), slide 2 "Scan receipts, skip typing" (camera → expense visual), slide 3 "Your data stays on your device" (privacy/offline promise). Monochrome illustrations, skip button, progress dots, final CTA "Get Started".
2. **Sign Up:** email, password, "Continue with Google" button, link to Sign In. Minimal, centered, generous whitespace.
3. **Sign In:** email, password, forgot-password link, Google button.

**Group B — Core Expense Flow**
4. **Home / Dashboard:** top = current month name + huge total spent this month (32/Bold, white); below = horizontal row of small category breakdown cards (icon, name, amount); then "Today" total; then "Recent" list of last 5 expenses (category icon chip, name/note, date, amount right-aligned). FAB bottom right. Include an offline indicator pill (subtle, `warning` color dot + "Offline") shown when disconnected.
5. **Add Expense (bottom sheet):** amount display + custom numeric keypad (Section 5), horizontal scrollable category chip grid (icon + name, selected = white outline), date row (default "Today", tappable), optional note field, full-width "Save" primary button. The entire flow must feel achievable in 3 taps.
6. **History:** grouped list by date ("Today", "Yesterday", then dates), month selector at top (‹ June 2026 ›), filter chips row (All + categories), swipe-left on a row reveals delete; deleting shows an undo snackbar. Each row: category chip, note/category name, time, amount.
7. **Categories:** grid or list of category cards (icon, color dot, name, monthly total), edit on tap, "Add Category" card with icon picker + the 4-color chip palette.

**Group C — People / Khata (the ledger)**
8. **People (tab):** top summary card split in two — left "You'll receive" total in green, right "You'll pay" total in red; search bar; list of people rows: initials avatar, name, net balance right-aligned and color-coded (green "Rs. 2,000" / red "Rs. 500" / neutral "✓ Settled" badge when zero). "Add Person" button.
9. **Person Detail:** large balance card at top stating direction clearly ("Basit owes you Rs. 2,000" in green, or "You owe Basit Rs. 500" in red, or "All settled ✓"); two prominent side-by-side buttons: **"You Gave"** (red accent text/icon) and **"You Got"** (green accent text/icon); below = transaction timeline (each entry: direction arrow, amount colored by direction, note, date+time); a small "Settle Up" shortcut button appears when balance ≠ 0.
10. **Add Person (bottom sheet):** name field (required), phone (optional), "Import from contacts" secondary button.
11. **Add Khata Transaction (bottom sheet, opens from You Gave / You Got):** reuses the numeric keypad; note field labeled "What for? (optional)"; date & time row (default now, editable); Save button tinted by direction (red for gave, green for got — text/border tint, not full fill).

**Group D — Reports**
12. **Reports (tab):** segmented control or tabs: Overview / Categories / Trends. Overview: this month total vs last month with % change chip (green ↓ spending is good, red ↑), daily average, biggest expense card. Categories: donut chart (category colors, monochrome center total) + ranked list. Trends: daily bar chart for the month + 6-month line chart. Below all tabs: an **"Udhaar" section** — given this month, received back, total outstanding, top 3 people mini-list. Keep udhaar visually separated (own card) from spending stats.
13. **Monthly Report Detail:** shareable report card layout — month title, total spent, top 3 categories with mini bars, comparison vs last month, biggest spending day, udhaar summary; "Share as Image" button. Design it to look good as a standalone exported image.

**Group E — OCR Scanning**
14. **Scan Receipt:** camera view with a receipt-shaped frame guide overlay (rounded rectangle, dimmed outside), hint text "Fit the receipt in the frame · good lighting helps", gallery pick icon, capture button; after capture → preview with "Retake" / "Use Photo". Also design the **bad-photo dialog**: "Photo isn't clear enough" with Retake and Enter Manually buttons.
15. **Review & Confirm:** header "Check the details"; extracted fields as editable inputs — Amount (huge, pre-filled, highlighted), Merchant, Date, suggested Category chip row; any low-confidence field gets a subtle `warning` border + "please verify" microcopy; receipt photo thumbnail at bottom (tap to expand); primary "Confirm & Save" button. Message to convey: AI suggested, user decides.

**Group F — Account & Sync**
16. **Account (tab):** profile row (avatar, name, email), then settings groups: Currency, Theme (Dark/Light/System), Sync & Backup (leads to Sync Status), Export CSV, About, Logout (red text). **Sync Status screen:** big status icon (synced ✓ / pending ↻ / offline), "Last synced" timestamp, pending changes count, "Sync now" button.

### 7. Logo & Splash Screen

**App Logo / Icon:**
- Design an app icon that works at 48px and 512px: a **monochrome mark** — white symbol on pure black (#0A0A0A) background, rounded-square (Android adaptive icon safe zone respected: keep the mark within the center 66% of the canvas)
- Concept directions to explore (propose 3 options, pick the strongest):
  1. A minimal **"T" lettermark** where the T's crossbar is styled as a receipt edge or ledger line
  2. A **receipt silhouette** with a zigzag torn bottom edge, ultra-simplified to 2–3 strokes
  3. A **checkmark-in-tab** mark — a small tab/bookmark shape containing a tick (tabs kept + money tracked)
- Rules: flat, single-color mark, no gradients, no thin strokes that vanish at small sizes, no text other than the lettermark itself. It must stay recognizable as a 24px pure-white silhouette (Android requires a monochrome notification icon variant — design this too)
- One permitted exception to the monochrome rule: an optional variant with a single small green (#22C55E) accent dot or tick — present both variants; monochrome remains primary

**Splash Screen:**
- Pure #0A0A0A background, logo mark centered at ~96px, app name "TabKeep" in Inter Medium 17 in `text-secondary` ~16px below the mark — nothing else. No taglines, no spinners, no version numbers
- Must match Expo's splash format: one static centered image on a solid background color (no complex layouts)
- Light-theme variant: same mark in black on #FFFFFF
- Design the **first-frame handoff**: splash background must match Onboarding slide 1 / Home background so the transition feels seamless

### 8. Do / Don't

- DO keep 90% of every screen monochrome; color must be rare and meaningful
- DO right-align all amounts in lists with tabular numbers
- DO design realistic Pakistani/international mixed data (Rs. amounts, names like Basit, Ali, Sarah; categories Food, Rent, Bills, Transport)
- DON'T use gradients, glassmorphism, or decorative color washes
- DON'T use green/red anywhere except money direction
- DON'T design only happy paths — every screen needs empty/loading/error variants
- DON'T use more than one primary button per screen

### 9. Deliverables

1. Style guide frame: color tokens, typography scale, spacing, radius, button set, chip set, input set, keypad component, avatar set — with component states (default, pressed, disabled, error)
2. **Logo:** 3 icon concepts → chosen mark at 512px (adaptive-icon layout) + 24px monochrome notification variant + optional green-accent variant
3. **Splash screen:** dark + light variants, Expo-compatible (centered static image on solid background)
4. All 16 screens (dark theme) at 390×844
5. Empty-state variants for Home, History, People, Reports
6. Light theme variants of the style guide + Home, People, Reports (3 screens minimum)

---

## END OF PROMPT

**Tips (for you, not the design tool):**
- Generate the style guide FIRST and approve it before generating screens — everything inherits from it.
- Generate one group (A–F) at a time; jab ek group pasand aa jaye tab agla karo.
- Jo screen pasand na aaye, poori dobara generate karne ke bajaye targeted feedback do: "Screen 9: make the balance card taller and the two buttons full-width."
- Final designs ko Figma mein le jao (Claude Design se export ya recreate) — kyunke Figma file khud portfolio asset hai aur development ke waqt exact spacing/values wahan se milengi.
