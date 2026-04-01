import { create } from 'zustand';
import type { RoomLayout } from '../types/room';
import type { Table } from '../types/table';
import type { WorkerState } from '../types/worker-messages';
import { DEFAULT_ROOM_WIDTH, DEFAULT_ROOM_HEIGHT, DEFAULT_GRID_SIZE, DEFAULT_BG_COLOR } from '../utils/constants';

interface RenderStoreState {
  room: RoomLayout;
  tables: Table[];
  canUndo: boolean;
  canRedo: boolean;
  dirty: boolean;
  sync: (state: WorkerState) => void;
}

const defaultRoom: RoomLayout = {
  id: '',
  name: 'Untitled Room',
  widthPx: DEFAULT_ROOM_WIDTH,
  heightPx: DEFAULT_ROOM_HEIGHT,
  gridSize: DEFAULT_GRID_SIZE,
  backgroundColor: DEFAULT_BG_COLOR,
  elements: [],
};

export const useRenderStore = create<RenderStoreState>((set) => ({
  room: defaultRoom,
  tables: [],
  canUndo: false,
  canRedo: false,
  dirty: false,
  sync: (state) =>
    set({
      room: state.room,
      tables: state.tables,
      canUndo: state.canUndo,
      canRedo: state.canRedo,
      dirty: state.dirty,
    }),
}));
