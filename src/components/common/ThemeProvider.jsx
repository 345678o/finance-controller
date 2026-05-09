import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";

export default function ThemeProvider({ children }) {
  const themeId = useThemeStore((s) => s.themeId);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", themeId);

    const meta = document.querySelector('meta[name="theme-color"]');
    const swatch = getComputedStyle(root).getPropertyValue("--t-primary").trim();
    if (meta && swatch) meta.setAttribute("content", swatch);
  }, [themeId]);

  return children;
}
