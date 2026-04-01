import * as Comlink from 'comlink';
import { DesignerState } from './state';
import type { DesignerWorkerAPI } from '../types/worker-messages';
import type { RoomLayout, RoomElement, RoomElementType } from '../types/room';
import type { Table, SeatLayout } from '../types/table';
import type { Point, AlignAxis, DistributeAxis, ArrangePattern } from '../types/geometry';

const state = new DesignerState();

const api: DesignerWorkerAPI = {
  async initialize(room?: RoomLayout, tables?: Table[], seatLayouts?: SeatLayout[]) {
    return state.initialize(room, tables, seatLayouts);
  },

  async addTableFromPreset(presetId: string, position: Point) {
    return state.addTableFromPreset(presetId, position);
  },

  async moveTable(tableId: string, x: number, y: number, snap: boolean) {
    return state.moveTable(tableId, x, y, snap);
  },

  async rotateTable(tableId: string, angle: number) {
    return state.rotateTable(tableId, angle);
  },

  async addElement(type: RoomElementType, position: Point) {
    return state.addElement(type, position);
  },

  async updateElement(id: string, changes: Partial<RoomElement>) {
    return state.updateElement(id, changes);
  },

  async removeItems(ids: string[]) {
    return state.removeItems(ids);
  },

  async duplicateItems(ids: string[]) {
    return state.duplicateItems(ids);
  },

  async alignItems(ids: string[], axis: AlignAxis) {
    return state.alignItems(ids, axis);
  },

  async distributeItems(ids: string[], axis: DistributeAxis) {
    return state.distributeItems(ids, axis);
  },

  async arrangeItems(ids: string[], pattern: ArrangePattern, roomW: number, roomH: number) {
    return state.arrangeItems(ids, pattern, roomW, roomH);
  },

  async undo() {
    return state.undo();
  },

  async redo() {
    return state.redo();
  },

  async setRoomProperties(props: Partial<RoomLayout>) {
    return state.setRoomProperties(props);
  },

  async getState() {
    return state.getState();
  },
};

Comlink.expose(api);
