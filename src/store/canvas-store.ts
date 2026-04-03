import { create } from 'zustand';
import { MIN_SCALE, MAX_SCALE, ZOOM_STEP } from '../utils/constants';
import { clamp } from '../utils/math';

export type DrawingTool =
  | 'select'
  | 'rect' | 'ellipse' | 'line' | 'polygon' | 'freehand' | 'text'
  | 'draw_round_table' | 'draw_rect_table' | 'draw_oval_table';

interface CanvasStoreState {
  scale: number;
  position: { x: number; y: number };
  showGrid: boolean;
  snapToGrid: boolean;

  // Drawing mode
  activeTool: DrawingTool;
  drawStrokeColor: string;
  drawFillColor: string;
  drawStrokeWidth: number;
  drawCornerRadius: number;

  setScale: (scale: number) => void;
  setPosition: (x: number, y: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: (roomW: number, roomH: number, viewW: number, viewH: number) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;

  setActiveTool: (tool: DrawingTool) => void;
  setDrawStrokeColor: (color: string) => void;
  setDrawFillColor: (color: string) => void;
  setDrawStrokeWidth: (width: number) => void;
  setDrawCornerRadius: (radius: number) => void;
}

export const useCanvasStore = create<CanvasStoreState>((set) => ({
  scale: 0.6,
  position: { x: 50, y: 50 },
  showGrid: true,
  snapToGrid: true,

  activeTool: 'select',
  drawStrokeColor: '#2D3748',
  drawFillColor: 'transparent',
  drawStrokeWidth: 2,
  drawCornerRadius: 0,

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

  setActiveTool: (activeTool) => set({ activeTool }),
  setDrawStrokeColor: (drawStrokeColor) => set({ drawStrokeColor }),
  setDrawFillColor: (drawFillColor) => set({ drawFillColor }),
  setDrawStrokeWidth: (drawStrokeWidth) => set({ drawStrokeWidth }),
  setDrawCornerRadius: (drawCornerRadius) => set({ drawCornerRadius }),
}));
