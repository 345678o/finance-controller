import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

/**
 * On Android, intercept the hardware/system back button:
 *   - if there's history → go back inside the SPA
 *   - if at the root route → require two presses within 2s to exit
 */
export default function useAndroidBackButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const lastTapRef = useRef(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return;

    let handle;
    let cancelled = false;

    (async () => {
      try {
        handle = await App.addListener("backButton", () => {
          if (pathname !== "/") {
            if (window.history.length > 1) navigate(-1);
            else navigate("/");
            return;
          }
          const now = Date.now();
          if (now - lastTapRef.current < 2000) {
            App.exitApp();
          } else {
            lastTapRef.current = now;
            if (navigator.vibrate) navigator.vibrate(30);
          }
        });
      } catch (e) {
        console.warn("[backButton] listener setup failed:", e);
      }
    })();

    return () => {
      cancelled = true;
      try { handle && handle.remove(); } catch {}
    };
  }, [navigate, pathname]);
}
