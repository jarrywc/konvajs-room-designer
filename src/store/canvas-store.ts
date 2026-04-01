import { create } from 'zustand';
import { MIN_SCALE, MAX_SCALE, ZOOM_STEP } from '../utils/constants';
import { clamp } from '../utils/math';

interface CanvasStoreState {
  scale: number;
  position: { x: number; y: number };
  showGrid: boolean;
  snapToGrid: boolean;

  setScale: (scale: number) => void;
  setPosition: (x: number, y: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: (roomW: number, roomH: number, viewW: number, viewH: number) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
}

export const useCanvasStore = create<CanvasStoreState>((set) => ({
  scale: 0.6,
  position: { x: 50, y: 50 },
  showGrid: true,
  snapToGrid: true,

  setScale: (scale) => set({ scale: clamp(scale, MIN_SCALE, MAX_SCALE) }),
  setPosition: (x, y) => set({ position: { x, y } }),

  zoomIn: () =>
    set((s) => ({ scale: clamp(s.scale + ZOOM_STEP, MIN_SCALE, MAX_SCALE) })),

  zoomOut: () =>
    set((s) => ({ scale: clamp(s.scale - ZOOM_STEP, MIN_SCALE, MAX_SCALE) })),

  zoomToFit: (roomW, roomH, viewW, viewH) => {
    const scaleX = viewW / roomW;
    const scaleY = viewH / roomH;
    const fitScale = clamp(Math.min(scaleX, scaleY) * 0.9, MIN_SCALE, MAX_SCALE);
    const x = (viewW - roomW * fitScale) / 2;
    const y = (viewH - roomH * fitScale) / 2;
    set({ scale: fitScale, position: { x, y } });
  },

  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
}));
