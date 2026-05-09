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
      transactions: mockTransactions,
      jars: mockJars,
      auraScore: 78,
      streak: 7,
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

      // ───── reset (handy for the demo) ─────
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
    }),
    {
      name: "auraloop-store",
      storage: createJSONStorage(() => localStorage),
      version: 2,
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
