<div align="center">

# 🌅 AuraLoop

### Round-up · Save · Glow

*A modern fintech dashboard that quietly turns every spend into savings — and keeps your money vibe positive.*

[![Made with React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![Zustand](https://img.shields.io/badge/State-Zustand-FF6B35?logo=react&logoColor=white)](https://zustand-demo.pmnd.rs)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps)

[![Last Commit](https://img.shields.io/github/last-commit/345678o/finance-controller?style=flat&color=22C55E)](https://github.com/345678o/finance-controller/commits/main)
[![Repo Size](https://img.shields.io/github/repo-size/345678o/finance-controller?style=flat&color=F5C842)](https://github.com/345678o/finance-controller)
[![Stars](https://img.shields.io/github/stars/345678o/finance-controller?style=flat&color=FF8C7A)](https://github.com/345678o/finance-controller/stargazers)

</div>

---

## ✨ What it does

AuraLoop is a personal-finance app for Gen-Z that turns the boring chore of expense-tracking into something playful. Every transaction quietly rounds up to the nearest ₹10/₹20/₹50, the spare change stacks into goal jars, and your weekly *aura score* tells you whether your money habits are glowing or burning out.

It runs as a **responsive desktop dashboard, a PWA, or a real Android app** — same code everywhere.

## 🧩 Highlights

| | |
| :--- | :--- |
| 📊 **Responsive dashboard** | Desktop top-nav with palette switcher, mobile bottom-nav, max-width container, touch-friendly hit-targets |
| 🎨 **Dynamic theme palettes** | Mustard · Lavender · Sunset · Mint — every component reads from CSS-variable tokens, no random colours |
| 🎯 **Goal jars** | Round-ups stack toward whatever you're saving for. Auto-save on or off, your call. |
| 🔮 **Aura score** | Numeric vibe-check on your spending — stable / risky / danger, with weekly captions |
| 💸 **Wrapped** | A "this week in your wallet" recap with top merchant, danger hour, and impulse-spend % |
| 📱 **SMS auto-import** | On Android, parses real bank SMS into transactions — no manual entry, nothing leaves your phone |
| ⚡ **PWA + native shells** | Installable on iOS/Android/desktop as a PWA, or as a real `.apk` via Capacitor |
| 🌗 **Animated everything** | Framer Motion throughout — soft hover lift, animated tab indicators, count-up numbers |

## 🛠️ Tech stack

```
React 18  ·  Vite 5  ·  Tailwind 3  ·  Framer Motion  ·  Zustand  ·  React Router 7
Capacitor 8 (Android shell)  ·  vite-plugin-pwa  ·  Lucide icons
```

## 📁 Structure

```
src/
├── components/common/    # OutlinedCard, TopNav, BottomNav, ThemeProvider, Sidebar
├── pages/                # Dashboard, GoalJars, Wrapped, Insights, Profile, ImportSms…
├── layouts/AppShell.jsx  # Responsive shell — desktop top-nav, mobile bottom-nav
├── sms/                  # Bank-SMS parser core + per-bank parsers
│   ├── BankParser.js              # base class
│   ├── BaseIndianBankParser.js    # INR + investment-keyword detection
│   ├── CompiledPatterns.js        # shared regex
│   ├── BankParserFactory.js       # sender → parser routing
│   └── banks/                     # HDFC · SBI · ICICI · Axis · Kotak
├── store/                # zustand stores (transactions, jars, theme)
├── hooks/                # useDashboardData, useCountUp, useAndroidBackButton
├── utils/                # format, dashboard math, wrapped math
└── styles/themes.css     # palette tokens (data-theme="…")
```

## 🚀 Getting started

```bash
# Install
npm install

# Run web dev server
npm run dev

# Build for production
npm run build && npm run preview
```

### 📱 Run on Android

Requires Android Studio + an Android phone (or emulator). One-time setup is already done — `capacitor.config.json` and the `android/` Gradle project are committed.

```bash
npm run android        # rebuild web + sync into Android project
npm run android:open   # ↑ then open Android Studio
npm run android:apk    # ↑ then build a debug APK via Gradle
```

In Android Studio, set the **Gradle JDK to a bundled JBR (17 or 21)** — *not* system Java if you have 24+. Plug your phone in (or pair via Wi-Fi), enable **USB debugging**, hit ▶ Run.

### 🎨 Regenerate launcher icons / splash

Edit the SVG sources in `assets/`, then:

```bash
npm run android:assets
```

## 📜 Available scripts

| Command | What it does |
| :--- | :--- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview built app (incl. PWA service worker) |
| `npm run lint` | Run ESLint |
| `npm run android` | Build web + sync into Android project |
| `npm run android:open` | Above, then open Android Studio |
| `npm run android:apk` | Above, then `gradlew assembleDebug` for an APK |
| `npm run android:assets` | Regenerate Android icons + splashes from `assets/` |

## 📨 SMS auto-import (Android only)

iOS doesn't allow SMS reading at all — Android-only feature.

1. **Allow SMS permission** when prompted (or grant manually in Android settings)
2. Tap **Import SMS** on the dashboard or in Settings
3. The scanner reads up to 6 months of inbox messages, filters out OTPs / promos, parses transactions per-bank, and shows a review screen
4. Tick the ones you want and **Import** — they land in your dashboard with auto-categorisation and round-up savings already computed

Currently supports: **HDFC · SBI · ICICI · Axis · Kotak** + a generic fallback for other Indian banks. Adding a new bank is one file in `src/sms/banks/`.

> Bank-SMS parsing patterns adapted from [PennyWise](https://github.com/sarim2000/pennywiseai-tracker) (MIT licensed).

## 🎨 Theme palettes

Every component reads from CSS variables published per `[data-theme]`:

| Theme | Primary | Secondary | Accent |
| :--- | :---: | :---: | :---: |
| **Mustard** *(default)* | 🟡 `#F5C842` | 🟢 `#5DD3CB` | 🟠 `#FF8C7A` |
| **Lavender** | 🟣 `#C4B5FD` | 🌸 `#FBCFE8` | 🟢 `#5DD3CB` |
| **Sunset** | 🟠 `#FF8C7A` | 🟡 `#F5C842` | 🟣 `#C4B5FD` |
| **Mint** | 🟢 `#5DD3CB` | 🟣 `#C4B5FD` | 🟡 `#F5C842` |

Switch via the palette icon in the desktop top-nav. Selection persists in localStorage.

## 🔐 Privacy

- **All data is local.** Transactions, jars, settings live in `localStorage` only.
- **No analytics.** No telemetry, no third-party SDKs.
- **SMS parsing** runs entirely on-device — nothing is uploaded.

## 🗺️ Roadmap

- [ ] Background SMS listener (auto-import as messages arrive)
- [ ] Live-reload Capacitor dev mode for faster on-device iteration
- [ ] iOS shell via Capacitor (no SMS — but everything else)
- [ ] More bank parsers (Yes Bank, IDBI, IndusInd, AU Bank…)
- [ ] Cloud backup (opt-in, end-to-end encrypted)

## 📄 License

MIT — do whatever you like with it.
# AURALOOP-2.0
