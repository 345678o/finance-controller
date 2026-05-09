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

      // ───── actions ─────
      addTransaction: (txn) =>
        set((s) => ({ transactions: [txn, ...s.transactions] })),

      removeTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      addJar: (jar) =>
        set((s) => ({ jars: [...s.jars, { ...jar, saved: 0 }] })),

      contributeToJar: (jarId, amount) =>
        set((s) => ({
          jars: s.jars.map((j) =>
            j.id === jarId ? { ...j, saved: Math.min(j.target, j.saved + amount) } : j,
          ),
        })),

      removeJar: (jarId) =>
        set((s) => ({ jars: s.jars.filter((j) => j.id !== jarId) })),

      setAuraScore: (auraScore) => set({ auraScore }),
      setStreak: (streak) => set({ streak }),
      setWrappedData: (wrappedData) => set({ wrappedData }),
      setInsights: (insights) => set({ insights }),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

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
      }),
    },
  ),
);
