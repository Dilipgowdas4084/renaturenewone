import { createContext, useCallback, useContext, useState } from 'react';

const STORAGE_KEY = 'renature-night';

const DayNightContext = createContext({ night: false, toggleNight: () => {} });

// Saved choice wins; otherwise follow the clock so evening visitors land at night.
function initialNight() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === '1';
  } catch { /* storage unavailable */ }
  const hour = new Date().getHours();
  return hour >= 19 || hour < 6;
}

export function DayNightProvider({ children }) {
  const [night, setNight] = useState(initialNight);

  const toggleNight = useCallback(() => {
    setNight(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0'); } catch { /* storage unavailable */ }
      return next;
    });
  }, []);

  return (
    <DayNightContext.Provider value={{ night, toggleNight }}>
      {children}
    </DayNightContext.Provider>
  );
}

export const useDayNight = () => useContext(DayNightContext);
