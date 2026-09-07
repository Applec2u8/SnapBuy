import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  reduceMotion: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleReduceMotion: () => void;
  setReduceMotion: (reduce: boolean) => void;
}

// Read directly from localStorage at module level for instant initial state
const getStoredTheme = (): 'light' | 'dark' => {
  try {
    const saved = localStorage.getItem('theme-storage');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.state?.theme) return parsed.state.theme;
    }
    // Fallback to system preference if no saved setting
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (e) {
    return 'light';
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: getStoredTheme(),
      reduceMotion: false,
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        return { theme: newTheme };
      }),
      setTheme: (theme) => set({ theme }),
      toggleReduceMotion: () => set((state) => ({ reduceMotion: !state.reduceMotion })),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
