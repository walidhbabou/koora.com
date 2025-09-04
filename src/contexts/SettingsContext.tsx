import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type HourFormat = '12' | '24';

interface SettingsContextValue {
  timezone: string;
  setTimezone: (tz: string) => void;
  hourFormat: HourFormat;
  setHourFormat: (fmt: HourFormat) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  timezone: 'settings.timezone',
  hourFormat: 'settings.hourFormat',
};

function getDefaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function getDefaultHourFormat(): HourFormat {
  // Default to 24h for most locales; we'll detect from locale options if possible
  try {
    const sample = new Date('2025-01-01T13:00:00Z');
    const uses12h = /AM|PM|ص|م/i.test(sample.toLocaleTimeString(undefined));
    return uses12h ? '12' : '24';
  } catch {
    return '24';
  }
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }>= ({ children }) => {
  const [timezone, setTimezone] = useState<string>(() => (
    typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEYS.timezone) || getDefaultTimezone()) : getDefaultTimezone()
  ));
  const [hourFormat, setHourFormat] = useState<HourFormat>(() => (
    typeof window !== 'undefined' ? ((localStorage.getItem(STORAGE_KEYS.hourFormat) as HourFormat) || getDefaultHourFormat()) : getDefaultHourFormat()
  ));

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.timezone, timezone);
  }, [timezone]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEYS.hourFormat, hourFormat);
  }, [hourFormat]);

  const value = useMemo(() => ({ timezone, setTimezone, hourFormat, setHourFormat }), [timezone, hourFormat]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
