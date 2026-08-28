export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "lumina-theme";

// localStorage throws rather than returning null when storage is disabled or the tab is
// in Safari private mode, so every access is guarded. Losing the preference is
// acceptable; breaking the toggle is not.
function safeRead(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignored on purpose — see above.
  }
}

export function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function readStoredTheme(): Theme | undefined {
  const stored = safeRead(THEME_STORAGE_KEY);
  return stored === "dark" || stored === "light" ? stored : undefined;
}

export function storeTheme(theme: Theme): void {
  safeWrite(THEME_STORAGE_KEY, theme);
}

/** The theme the visitor picked last time, falling back to their operating system. */
export function resolveTheme(): Theme {
  return readStoredTheme() ?? (systemPrefersDark() ? "dark" : "light");
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/**
 * Runs in <head> before the first paint so a returning dark-mode visitor never sees a
 * flash of the light theme — React can only set the class after hydration, which is far
 * too late.
 *
 * This repeats the logic in `resolveTheme` because it has to execute as a standalone
 * string before any module has loaded. Sharing THEME_STORAGE_KEY is what stops the two
 * from drifting apart.
 */
export const themeBootstrapScript = `try{var k="${THEME_STORAGE_KEY}",s=localStorage.getItem(k),d=s==="dark"||(!s&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}`;
