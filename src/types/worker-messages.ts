import type { RoomLayout, RoomElement, RoomElementType } from './room';
import type { Table, SeatLayout } from './table';
import type { Point, AlignAxis, DistributeAxis, ArrangePattern } from './geometry';

/** The full state returned by the worker after mutations */
export interface WorkerState {
  room: RoomLayout;
  tables: Table[];
  canUndo: boolean;
  canRedo: boolean;
  dirty: boolean;
}

/** API exposed by the worker via Comlink */
export interface DesignerWorkerAPI {
  // Initialization
  initialize(room?: RoomLayout, tables?: Table[], seatLayouts?: SeatLayout[]): Promise<WorkerState>;

  // Tables
  addTableFromPreset(presetId: string, position: Point): Promise<WorkerState>;
  moveTable(tableId: string, x: number, y: number, snap: boolean): Promise<WorkerState>;
  rotateTable(tableId: string, angle: number): Promise<WorkerState>;

  // Room elements
  addElement(type: RoomElementType, position: Point): Promise<WorkerState>;
  updateElement(id: string, changes: Partial<RoomElement>): Promise<WorkerState>;

  // Shared
  removeItems(ids: string[]): Promise<WorkerState>;
  duplicateItems(ids: string[]): Promise<WorkerState>;

  // Alignment / arrangement
  alignItems(ids: string[], axis: AlignAxis): Promise<WorkerState>;
  distributeItems(ids: string[], axis: DistributeAxis): Promise<WorkerState>;
  arrangeItems(ids: string[], pattern: ArrangePattern, roomW: number, roomH: number): Promise<WorkerState>;

  // History
  undo(): Promise<WorkerState | null>;
  redo(): Promise<WorkerState | null>;

  // Room properties
  setRoomProperties(props: Partial<RoomLayout>): Promise<WorkerState>;

  // Export
  getState(): Promise<WorkerState>;
}
