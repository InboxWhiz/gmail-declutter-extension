// src/_shared/providers/themeContext.ts
import { createContext } from "react";

export type Theme = "light" | "dark";

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const defaultThemeContext: ThemeContextType = {
  theme: "light",
  toggleTheme: () => console.warn("ThemeProvider not initialized"),
};

export const ThemeContext =
  createContext<ThemeContextType>(defaultThemeContext);
