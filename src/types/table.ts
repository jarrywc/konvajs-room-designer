export type TableShape = 'rectangle' | 'oval' | 'round';
export type SeatShape = 'circle' | 'square' | 'rounded_rect';

export interface SeatLayout {
  id: string;
  name: string;
  description?: string;
  seatCount: number;
  leftCount: number;
  rightCount: number;
  topCount: number;
  bottomCount: number;
  tableShape: TableShape;
  isDefault: boolean;
}

export interface Seat {
  id: string;
  seatNumber: number;
  /** X position relative to the table's origin */
  x: number;
  /** Y position relative to the table's origin */
  y: number;
  radius: number;
  /** True if user has manually repositioned this seat */
  customPositioned?: boolean;
}

export interface Table {
  id: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  seatLayoutId: string;
  /** For freeform-drawn tables, the shape is stored directly (overrides layout) */
  tableShape?: TableShape;
  seats: Seat[];
  /** Computed width of the table card/shape */
  width: number;
  /** Computed height of the table card/shape */
  height: number;
  cornerRadius?: number;
  seatShape?: SeatShape;
}

export interface TablePreset {
  id: string;
  name: string;
  description?: string;
  seatLayoutId: string;
  defaultName: string;
  icon: string;
}
