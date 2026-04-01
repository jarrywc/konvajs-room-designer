export { RoomDesigner } from './RoomDesigner';
export type { RoomDesignerProps, RoomDesignerHandle } from './RoomDesigner';

// Types
export type {
  Point,
  BBox,
  AlignAxis,
  DistributeAxis,
  ArrangePattern,
  RoomElementType,
  RoomElement,
  RoomLayout,
  TableShape,
  SeatLayout,
  Seat,
  Table,
  TablePreset,
  DesignerState,
  WorkerState,
} from './types';

// Presets
export { SEAT_LAYOUTS, getSeatLayout } from './presets/seat-layouts';
export { TABLE_PRESETS, getTablePreset } from './presets/table-presets';
export { ROOM_ELEMENT_CATALOG, getCatalogEntry } from './presets/element-catalog';
