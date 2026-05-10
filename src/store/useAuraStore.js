import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mockTransactions, mockJars } from "@/data/mockTransactions";

const sumSaved = (txns) =>
  txns.reduce((acc, t) => acc + (t.savedAmount || 0), 0);

const initialWrapped = {
  generatedAt: null,
  topCategory: null,
  topMerchant: null,
  totalSpent: 0,
  totalSaved: 0,
  vibe: "calm",
};

const initialInsights = [
  {
    id: "ins_food_spike",
    title: "Food spend spiked 32% this week",
    body: "Late-night Swiggy orders are quietly running the show.",
    severity: "warn",
  },
  {
    id: "ins_streak",
    title: "You round-up saved 7 days in a row",
    body: "That's ₹248 in invisible savings. Keep the loop going.",
    severity: "good",
  },
];

const initialSettings = {
  roundUpStep: 10,           // 10 / 20 / 50
  autoSave: true,
  notifyDailyDigest: true,
  notifyInvisibleSpend: true,
  notifyJarMilestones: false,
  excludeSubscriptions: false,
};

const initialUpi = {
  linked: false,
  appId: null,        // 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'amazonpay' | 'cred'
  vpa: null,          // user's UPI VPA, e.g. "anamika@oksbi"
  autoDebit: false,   // route round-ups via UPI mandate
  syncTxns: true,     // pull transactions from the linked app's notifications
  linkedAt: null,
};

const initialProfile = {
  displayName: "Anamika",
  handle: "anamika.aura",
  email: "anamika@auraloop.app",
  avatarEmoji: "🌅",
  avatarImage: null,  // base64 data URL — takes precedence over emoji when set
  joinedAt: null,     // backfilled to first-write timestamp
};

export const useAuraStore = create(
  persist(
    (set, get) => ({
      // ───── state ─────
      // Default state is now empty — users start with a clean slate and
      // import real transactions via SMS / email. Demo data is still
      // available on demand via `resetToDemo`.
      transactions: [],
      jars: mockJars,
      auraScore: 0,
      streak: 0,
      wrappedData: initialWrapped,
      insights: initialInsights,
      settings: initialSettings,
      upi: initialUpi,
      profile: initialProfile,
      memeNonce: 0, // bumps on every transactional action — UI uses this to fire memes
      lastMemeMood: null, // "saved" | "spent" — drives which meme pool the toast pulls from

      // ───── actions ─────
      addTransaction: (txn) =>
        set((s) => ({
          transactions: [txn, ...s.transactions],
          memeNonce: s.memeNonce + 1,
          lastMemeMood: "spent",
        })),

      removeTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      addJar: (jar) =>
        set((s) => ({ jars: [...s.jars, { ...jar, saved: 0 }] })),

      contributeToJar: (jarId, amount) =>
        set((s) => ({
          jars: s.jars.map((j) =>
            j.id === jarId ? { ...j, saved: Math.min(j.target, j.saved + amount) } : j,
          ),
          memeNonce: s.memeNonce + 1,
          lastMemeMood: "saved",
        })),

      /* Withdraw from a jar — money you actually spent, taken back out of your
         savings. Logs a transaction so it shows in spend metrics, and fires
         the spent-mood meme. The jar's saved amount can never go below zero. */
      withdrawFromJar: (jarId, amount, meta = {}) =>
        set((s) => {
          const safeAmount = Math.max(0, Math.min(amount, s.jars.find((j) => j.id === jarId)?.saved ?? 0));
          return {
            jars: s.jars.map((j) =>
              j.id === jarId ? { ...j, saved: Math.max(0, j.saved - safeAmount) } : j,
            ),
            transactions: [
              {
                id: `wd_${Date.now()}`,
                merchant: meta.merchant?.trim() || "Withdrawal",
                amount: safeAmount,
                savedAmount: 0,
                category: meta.category || "Other",
                paymentMethod: "Jar",
                vibe: "burn",
                timestamp: Date.now(),
                jarId,
                withdrawal: true,
              },
              ...s.transactions,
            ],
            memeNonce: s.memeNonce + 1,
            lastMemeMood: "spent",
          };
        }),

      bumpMeme: (mood = null) =>
        set((s) => ({ memeNonce: s.memeNonce + 1, lastMemeMood: mood })),

      removeJar: (jarId) =>
        set((s) => ({ jars: s.jars.filter((j) => j.id !== jarId) })),

      setAuraScore: (auraScore) => set({ auraScore }),
      setStreak: (streak) => set({ streak }),
      setWrappedData: (wrappedData) => set({ wrappedData }),
      setInsights: (insights) => set({ insights }),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      // ── UPI ────────────────────────────────────────────────────
      linkUpi: ({ appId, vpa }) =>
        set(() => ({
          upi: {
            linked: true,
            appId,
            vpa,
            autoDebit: false,
            syncTxns: true,
            linkedAt: Date.now(),
          },
        })),

      unlinkUpi: () => set(() => ({ upi: { ...initialUpi } })),

      updateUpi: (patch) =>
        set((s) => ({ upi: { ...s.upi, ...patch } })),

      // ── Profile ──────────────────────────────────────────────
      updateProfile: (patch) =>
        set((s) => ({
          profile: {
            ...s.profile,
            ...patch,
            joinedAt: s.profile.joinedAt || Date.now(),
          },
        })),

      // ───── selectors (computed via getters) ─────
      getTotalSaved: () => sumSaved(get().transactions),
      getTotalSpent: () =>
        get().transactions.reduce((acc, t) => acc + (t.amount || 0), 0),

      // ───── reset / clear ─────
      resetToDemo: () =>
        set({
          transactions: mockTransactions,
          jars: mockJars,
          auraScore: 78,
          streak: 7,
          wrappedData: initialWrapped,
          insights: initialInsights,
          settings: initialSettings,
          upi: initialUpi,
          profile: initialProfile,
        }),

      // Strip only demo (non-imported) transactions, keep SMS / email imports.
      clearDemoData: () =>
        set((s) => ({
          transactions: s.transactions.filter((t) => !!t.source),
          auraScore: s.transactions.some((t) => !!t.source) ? s.auraScore : 0,
          streak: s.transactions.some((t) => !!t.source) ? s.streak : 0,
        })),

      // Nuclear: empty everything.
      clearAllTransactions: () =>
        set({ transactions: [], auraScore: 0, streak: 0 }),
    }),
    {
      name: "auraloop-store",
      storage: createJSONStorage(() => localStorage),
      version: 3,
      // Migration from any older version → strip demo transactions.
      // Imported txns are tagged `source` so we keep those; everything else
      // (the old auto-seeded demo set) goes.
      migrate: (state) => {
        if (!state) return state;
        const kept = (state.transactions || []).filter((t) => !!t.source);
        const allDemo = kept.length === 0;
        return {
          ...state,
          transactions: kept,
          auraScore: allDemo ? 0 : state.auraScore,
          streak: allDemo ? 0 : state.streak,
        };
      },
      partialize: (s) => ({
        transactions: s.transactions,
        jars: s.jars,
        auraScore: s.auraScore,
        streak: s.streak,
        wrappedData: s.wrappedData,
        insights: s.insights,
        settings: s.settings,
        upi: s.upi,
        profile: s.profile,
      }),
    },
  ),
);
