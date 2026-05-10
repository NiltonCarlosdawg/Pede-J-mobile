import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { safeGetItem, safeSetItem } from '../utils/storage';
import { lightColors, darkColors, ThemeColors } from '../theme';

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  // Padrão é light (false)
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carrega preferência salva ao montar
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Listener para mudanças no tema do sistema (apenas se não houver preferência salva)
  useEffect(() => {
    if (!isLoaded) return;
    
    // Verifica se há preferência salva
    const checkSavedTheme = async () => {
      const savedTheme = await safeGetItem('@pedeja_theme');
      // Só aplica tema do sistema se não houver preferência salva
      if (savedTheme === null && systemColorScheme) {
        setIsDark(systemColorScheme === 'dark');
      }
    };
    
    checkSavedTheme();
  }, [systemColorScheme, isLoaded]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await safeGetItem('@pedeja_theme');
      if (savedTheme !== null) {
        // Usa preferência salva
        setIsDark(savedTheme === 'dark');
      } else {
        // Padrão é light, não usa tema do sistema automaticamente
        setIsDark(false);
      }
    } catch {
      // Em caso de erro, mantém light como padrão
      setIsDark(false);
    } finally {
      setIsLoaded(true);
    }
  };

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const newTheme = !prev;
      safeSetItem('@pedeja_theme', newTheme ? 'dark' : 'light').catch(() => {});
      return newTheme;
    });
  }, []);

  const setTheme = useCallback((dark: boolean) => {
    setIsDark(dark);
    safeSetItem('@pedeja_theme', dark ? 'dark' : 'light').catch(() => {});
  }, []);

  // Cores baseadas no tema atual
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook para obter apenas as cores (performance)
export function useThemeColors() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeColors must be used within a ThemeProvider');
  }
  return context.colors;
}
