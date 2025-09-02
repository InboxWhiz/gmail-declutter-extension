import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ThemeContext,
  ThemeMode,
  ThemeSetting,
  defaultThemeContext,
} from "./theme_context";

const STORAGE_KEY = "themeSetting";

function isExtContext() {
  return typeof chrome !== "undefined" && !!chrome.storage?.local;
}

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

async function readSetting(): Promise<ThemeSetting | null> {
  try {
    if (isExtContext()) {
      const setting = await new Promise<ThemeSetting | null>((resolve) => {
        chrome.storage.local.get([STORAGE_KEY], (res) => {
          resolve((res?.[STORAGE_KEY] as ThemeSetting | undefined) ?? null);
        });
      });
      return setting;
    } else {
      const raw = localStorage.getItem(STORAGE_KEY);
      return (raw as ThemeSetting | null) ?? null;
    }
  } catch {
    return null;
  }
}

async function writeSetting(setting: ThemeSetting) {
  try {
    if (isExtContext()) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEY]: setting }, () => resolve());
      });
    } else {
      localStorage.setItem(STORAGE_KEY, setting);
    }
  } catch {
    // ignore
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [setting, setSettingState] = useState<ThemeSetting>("system");
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(
    getSystemPrefersDark(),
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await readSetting();
      if (saved === "light" || saved === "dark" || saved === "system") {
        setSettingState(saved);
      } else {
        setSettingState("system");
      }
      setIsInitialized(true);
    })();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    void writeSetting(setting);
  }, [setting, isInitialized]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const theme: ThemeMode = useMemo<ThemeMode>(() => {
    if (setting === "system") {
      return systemPrefersDark ? "dark" : "light";
    }
    return setting;
  }, [setting, systemPrefersDark]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const setSetting = (s: ThemeSetting) => {
    setSettingState(s);
  };

  const resetToSystem = () => {
    setSettingState("system");
  };

  const toggleTheme = () => {
    if (setting === "system") {
      setSettingState(theme === "light" ? "dark" : "light");
      return;
    }
    setSettingState(setting === "light" ? "dark" : "light");
  };

  if (!isInitialized) {
    return <div style={{ display: "none" }} />;
  }

  return (
    <ThemeContext.Provider
      value={{ theme, setting, setSetting, toggleTheme, resetToSystem }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext) || defaultThemeContext;
