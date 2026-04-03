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
export const ROUND_SEAT_ORBIT_GAP = 2;

// Zoom limits
export const MIN_SCALE = 0.15;
export const MAX_SCALE = 3;
export const ZOOM_STEP = 0.05;

// Seat shapes
export const SEAT_SQUARE_SIZE = SEAT_RADIUS * 2; // 24
export const SEAT_ROUNDED_RECT_W = Math.round(SEAT_RADIUS * 2.5); // 30
export const SEAT_ROUNDED_RECT_H = Math.round(SEAT_RADIUS * 1.8); // 22
export const SEAT_ROUNDED_RECT_CORNER = 4;

// Freeform table drawing
export const MIN_SEAT_SPACING = 30;
export const FREEFORM_SEAT_ORBIT_GAP = 2;
export const MIN_FREEFORM_SEATS = 2;
export const MAX_FREEFORM_SEATS = 40;

// History
export const MAX_UNDO_STEPS = 50;
