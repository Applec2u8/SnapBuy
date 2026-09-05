import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
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
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
