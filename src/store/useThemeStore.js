import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const THEMES = [
  { id: "default",  label: "Mustard",  swatch: "#F5C842" },
  { id: "lavender", label: "Lavender", swatch: "#C4B5FD" },
  { id: "sunset",   label: "Sunset",   swatch: "#FF8C7A" },
  { id: "mint",     label: "Mint",     swatch: "#5DD3CB" },
];

export const useThemeStore = create(
  persist(
    (set) => ({
      themeId: "default",
      setTheme: (themeId) => set({ themeId }),
    }),
    {
      name: "auraloop-theme",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
