"use client";

import { useEffect, useSyncExternalStore } from "react";
import { SunMoon } from "lucide-react";

type Theme = "light" | "dark" | "system";
let memoryPreference: Theme = "system";
function getPreference(): Theme {
  try {
    const value = localStorage.getItem("edison-theme");
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return memoryPreference;
  }
}
function subscribe(callback: () => void) {
  window.addEventListener("edison-theme", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("edison-theme", callback);
    window.removeEventListener("storage", callback);
  };
}
const serverPreference = (): Theme => "system";

export function ThemeControl() {
  const preference = useSyncExternalStore(subscribe, getPreference, serverPreference);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = preference === "dark" || (preference === "system" && media.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preference]);
  return (
    <label className="theme-control">
      <SunMoon size={16} aria-hidden="true" />
      <span className="sr-only">Color theme</span>
      <select
        aria-label="Color theme"
        value={preference}
        onChange={(event) => {
          memoryPreference = event.target.value as Theme;
          try {
            localStorage.setItem("edison-theme", memoryPreference);
          } catch {
            /* Keep a session-only preference. */
          }
          window.dispatchEvent(new Event("edison-theme"));
        }}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  );
}
