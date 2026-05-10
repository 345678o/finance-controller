import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import "./index.css";
import App from "./App.jsx";

// Strip any registered service worker + caches in two cases:
//  - inside Capacitor (we ship JS via APK, the PWA SW just causes stale code)
//  - in dev mode (a SW left over from a prior `npm run build` would intercept
//    Vite's HMR and the page goes blank)
// Production web builds keep their SW intact via the production registerSW.
const shouldStripSW =
  (Capacitor.isNativePlatform() && "serviceWorker" in navigator) ||
  (import.meta.env.DEV && "serviceWorker" in navigator);

if (shouldStripSW) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});
  if ("caches" in window) {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
