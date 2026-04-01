// Default room dimensions
export const DEFAULT_ROOM_WIDTH = 2000;
export const DEFAULT_ROOM_HEIGHT = 1500;
export const DEFAULT_GRID_SIZE = 20;
export const DEFAULT_BG_COLOR = '#FFFFFF';

// Seat rendering
export const SEAT_RADIUS = 12;
export const SEAT_GAP = 4;

// Table card layout (matches Valence 25% scale)
export const TABLE_CARD_SEAT_W = 57;
export const TABLE_CARD_SEAT_H = 30;
export const TABLE_CARD_CENTER_W = 57;
export const TABLE_CARD_COL_GAP = 3;
export const TABLE_CARD_SEAT_GAP = 3;
export const TABLE_CARD_PAD_X = 6;
export const TABLE_CARD_PAD_Y = 6;
export const TABLE_CARD_HEADER = 34;
export const TABLE_CARD_BOTTOM_PAD = 6;
export const TABLE_CARD_W =
  TABLE_CARD_PAD_X +
  TABLE_CARD_SEAT_W +
  TABLE_CARD_COL_GAP +
  TABLE_CARD_CENTER_W +
  TABLE_CARD_COL_GAP +
  TABLE_CARD_SEAT_W +
  TABLE_CARD_PAD_X; // 189

// Round table rendering
export const ROUND_TABLE_RADIUS = 50;
export const ROUND_SEAT_ORBIT_GAP = 8;

// Zoom limits
export const MIN_SCALE = 0.15;
export const MAX_SCALE = 3;
export const ZOOM_STEP = 0.05;

// History
export const MAX_UNDO_STEPS = 50;
