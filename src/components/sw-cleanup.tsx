"use client";

import { useEffect } from "react";

/**
 * SwCleanup — runs once on mount.
 *
 * In DEVELOPMENT: unregisters all Service Workers so stale Serwist caches
 * cannot intercept hot-reload chunk requests and return 404s.
 *
 * In PRODUCTION: registers the Serwist SW (handled by @serwist/next automatically),
 * this component is a no-op.
 */
export function SwCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length === 0) return;
      registrations.forEach((reg) => {
        reg.unregister().then((unregistered) => {
          if (unregistered) {
            console.info(
              "[H365 Dev] Unregistered stale Serwist SW:",
              reg.scope
            );
          }
        });
      });
      // Hard-reload once to pick up fresh chunks from the dev server
      // Only do this if we actually had SWs to clear
      if (registrations.length > 0) {
        // Clear caches too so layout.css / page.js 404s don't persist
        caches.keys().then((keys) =>
          Promise.all(keys.map((k) => caches.delete(k)))
        ).then(() => {
          console.info("[H365 Dev] Cleared SW caches — reloading…");
          window.location.reload();
        });
      }
    });
  }, []);

  return null;
}
