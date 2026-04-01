import type { RoomLayout } from './room';
import type { Table } from './table';

export interface DesignerState {
  room: RoomLayout;
  tables: Table[];
  canUndo: boolean;
  canRedo: boolean;
  dirty: boolean;
}

export interface RoomDesignerCallbacks {
  onSave?: (state: DesignerState) => void;
  onChange?: (state: DesignerState) => void;
  onDiscard?: () => void;
}
