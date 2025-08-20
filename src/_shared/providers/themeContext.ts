import { createContext } from "react";

export type ThemeMode = "light" | "dark";
export type ThemeSetting = ThemeMode | "system";

export interface ThemeContextType {
  theme: ThemeMode;
  setting: ThemeSetting;
  setSetting: (s: ThemeSetting) => void;
  toggleTheme: () => void;
  resetToSystem: () => void;
}

export const defaultThemeContext: ThemeContextType = {
  theme: "light",
  setting: "system",
  setSetting: () => console.warn("ThemeProvider not initialized"),
  toggleTheme: () => console.warn("ThemeProvider not initialized"),
  resetToSystem: () => console.warn("ThemeProvider not initialized"),
};

export const ThemeContext =
  createContext<ThemeContextType>(defaultThemeContext);
