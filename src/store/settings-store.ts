import { create } from 'zustand';
import { FREEFORM_SEAT_ORBIT_GAP } from '../utils/constants';

export interface SeatGaps {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface SettingsStoreState {
  theme: 'light' | 'dark';
  seatColor: string;
  tableColor: string;
  selectedColor: string;
  gridColor: string;
  seatGaps: SeatGaps;

  setTheme: (theme: 'light' | 'dark') => void;
  setSeatColor: (color: string) => void;
  setTableColor: (color: string) => void;
  setSelectedColor: (color: string) => void;
  setGridColor: (color: string) => void;
  setSeatGap: (side: keyof SeatGaps, value: number) => void;
}

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  theme: 'light',
  seatColor: '#4A90D9',
  tableColor: '#CBD5E0',
  selectedColor: '#4299E1',
  gridColor: '#E2E8F0',
  seatGaps: {
    left: FREEFORM_SEAT_ORBIT_GAP,
    right: FREEFORM_SEAT_ORBIT_GAP,
    top: FREEFORM_SEAT_ORBIT_GAP,
    bottom: FREEFORM_SEAT_ORBIT_GAP,
  },

  setTheme: (theme) => set({ theme }),
  setSeatColor: (seatColor) => set({ seatColor }),
  setTableColor: (tableColor) => set({ tableColor }),
  setSelectedColor: (selectedColor) => set({ selectedColor }),
  setGridColor: (gridColor) => set({ gridColor }),
  setSeatGap: (side, value) =>
    set((s) => ({ seatGaps: { ...s.seatGaps, [side]: value } })),
}));
