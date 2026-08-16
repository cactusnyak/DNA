import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

import { SegmentedControl } from '@/components/ui/SegmentedControl';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

function getSavedTheme(): Theme {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  return savedTheme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

const themeOptions = [
  {
    value: 'light',
    label: (
      <>
        <Sun className="size-4" aria-hidden="true" />
        <span className="sr-only">Светлая тема</span>
      </>
    ),
  },
  {
    value: 'dark',
    label: (
      <>
        <Moon className="size-4" aria-hidden="true" />
        <span className="sr-only">Тёмная тема</span>
      </>
    ),
  },
] satisfies Parameters<typeof SegmentedControl<Theme>>[0]['options'];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>(getSavedTheme);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <SegmentedControl
      options={themeOptions}
      value={theme}
      onChange={setTheme}
      className="h-10 shrink-0"
    />
  );
}
