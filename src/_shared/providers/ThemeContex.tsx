import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const defaultThemeContext: ThemeContextType = {
  theme: 'light',
  toggleTheme: () => console.warn('ThemeProvider not initialized')
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if we're in a Chrome extension context
  const isExtensionContext = typeof chrome !== 'undefined' && 
                             chrome.storage && 
                             chrome.storage.local;

  useEffect(() => {
    const loadTheme = async () => {
      try {
        let savedTheme: Theme | null = null;
        
        if (isExtensionContext) {
          // Use promise-based API for chrome.storage
          savedTheme = await new Promise<Theme | null>((resolve) => {
            chrome.storage.local.get(['theme'], (result) => {
              resolve(result.theme || null);
            });
          });
        } else {
          // For non-extension contexts
          savedTheme = localStorage.getItem('theme') as Theme | null;
        }

        setTheme(savedTheme || 'light');
      } catch (error) {
        console.error('Error loading theme:', error);
        setTheme('light');
      } finally {
        setIsInitialized(true);
      }
    };

    loadTheme();
  }, [isExtensionContext]);

  useEffect(() => {
    if (!isInitialized) return;

    try {
      // Apply theme class to document
      document.documentElement.className = theme;
      
      // Persist theme preference
      if (isExtensionContext) {
        chrome.storage.local.set({ theme });
      } else {
        localStorage.setItem('theme', theme);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, [theme, isInitialized, isExtensionContext]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Don't render children until theme is loaded
  if (!isInitialized) {
    return <div className="theme-loading" style={{ display: 'none' }}></div>;
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