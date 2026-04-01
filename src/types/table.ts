export type TableShape = 'rectangle' | 'oval' | 'round';

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
}

export interface Table {
  id: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  seatLayoutId: string;
  seats: Seat[];
  /** Computed width of the table card/shape */
  width: number;
  /** Computed height of the table card/shape */
  height: number;
}

export interface TablePreset {
  id: string;
  name: string;
  description?: string;
  seatLayoutId: string;
  defaultName: string;
  icon: string;
}
