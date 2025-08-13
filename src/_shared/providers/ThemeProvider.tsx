import React, { useContext, useEffect, useState } from "react";
import { Theme, ThemeContext, defaultThemeContext } from "./themeContext";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [isInitialized, setIsInitialized] = useState(false);

  const isExtensionContext =
    typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;

  useEffect(() => {
    const loadTheme = async () => {
      try {
        let savedTheme: Theme | null = null;

        if (isExtensionContext) {
          savedTheme = await new Promise<Theme | null>((resolve) => {
            chrome.storage.local.get(["theme"], (result) => {
              resolve(result.theme || null);
            });
          });
        } else {
          savedTheme = localStorage.getItem("theme") as Theme | null;
        }

        setTheme(savedTheme || "light");
      } catch (error) {
        console.error("Error loading theme:", error);
        setTheme("light");
      } finally {
        setIsInitialized(true);
      }
    };

    loadTheme();
  }, [isExtensionContext]);

  useEffect(() => {
    if (!isInitialized) return;

    try {
      document.documentElement.className = theme;

      if (isExtensionContext) {
        chrome.storage.local.set({ theme });
      } else {
        localStorage.setItem("theme", theme);
      }
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  }, [theme, isInitialized, isExtensionContext]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  if (!isInitialized) {
    return <div className="theme-loading" style={{ display: "none" }}></div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext) || defaultThemeContext;
};
