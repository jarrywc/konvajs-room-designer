// Main component
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
export type { ElementCatalogEntry } from './presets/element-catalog';

// Valence adapters
export {
  toValenceRoomLayout,
  fromValenceRoomLayout,
} from './worker/adapters/valence-room';
export type {
  ValenceRoomLayoutData,
  ValenceRoomLayoutElementData,
} from './worker/adapters/valence-room';

export {
  toValencePlanTable,
  fromValencePlanTable,
} from './worker/adapters/valence-table';
export type { ValencePlanTableData } from './worker/adapters/valence-table';

export {
  toValenceSeat,
  fromValenceSeat,
} from './worker/adapters/valence-seat';
export type { ValenceSeat } from './worker/adapters/valence-seat';
