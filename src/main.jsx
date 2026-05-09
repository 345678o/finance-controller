import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import "./index.css";
import App from "./App.jsx";

// Inside the Capacitor WebView the assets are bundled in the APK — the
// vite-plugin-pwa service worker is unnecessary and causes stale JS.
// Unregister any SW + clear caches at startup on native so the next launch
// loads fresh code from the APK.
if (Capacitor.isNativePlatform() && "serviceWorker" in navigator) {
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
