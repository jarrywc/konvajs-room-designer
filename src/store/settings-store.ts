import { create } from 'zustand';

interface SettingsStoreState {
  theme: 'light' | 'dark';
  seatColor: string;
  tableColor: string;
  selectedColor: string;
  gridColor: string;

  setTheme: (theme: 'light' | 'dark') => void;
  setSeatColor: (color: string) => void;
  setTableColor: (color: string) => void;
  setSelectedColor: (color: string) => void;
  setGridColor: (color: string) => void;
}

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  theme: 'light',
  seatColor: '#4A90D9',
  tableColor: '#CBD5E0',
  selectedColor: '#4299E1',
  gridColor: '#E2E8F0',

  setTheme: (theme) => set({ theme }),
  setSeatColor: (seatColor) => set({ seatColor }),
  setTableColor: (tableColor) => set({ tableColor }),
  setSelectedColor: (selectedColor) => set({ selectedColor }),
  setGridColor: (gridColor) => set({ gridColor }),
}));
