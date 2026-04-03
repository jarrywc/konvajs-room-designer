import { useRef, useEffect, useCallback } from 'react';
import type { Remote } from 'comlink';
import type { DesignerWorkerAPI, WorkerState } from '../types/worker-messages';
import type { RoomLayout } from '../types/room';
import type { Table, SeatLayout } from '../types/table';
import { createWorkerBridge } from './worker-bridge';
import { useRenderStore } from '../store/render-store';

export function useWorker() {
  const apiRef = useRef<Remote<DesignerWorkerAPI> | null>(null);
  const terminateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const { api, terminate } = createWorkerBridge();
    apiRef.current = api;
    terminateRef.current = terminate;

    return () => {
      terminate();
      apiRef.current = null;
      terminateRef.current = null;
    };
  }, []);

  const syncState = useCallback((state: WorkerState | null) => {
    if (!state) return;
    useRenderStore.getState().sync(state);
  }, []);

  const api = apiRef.current;

  const initialize = useCallback(
    async (room?: RoomLayout, tables?: Table[], seatLayouts?: SeatLayout[]) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.initialize(room, tables, seatLayouts);
      syncState(state);
    },
    [syncState]
  );

  const addTableFromPreset = useCallback(
    async (presetId: string, position: { x: number; y: number }) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.addTableFromPreset(presetId, position);
      syncState(state);
    },
    [syncState]
  );

  const addFreeformTable = useCallback(
    async (params: Parameters<DesignerWorkerAPI['addFreeformTable']>[0]) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.addFreeformTable(params);
      syncState(state);
    },
    [syncState]
  );

  const moveTable = useCallback(
    async (tableId: string, x: number, y: number, snap: boolean) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.moveTable(tableId, x, y, snap);
      syncState(state);
    },
    [syncState]
  );

  const rotateTable = useCallback(
    async (tableId: string, angle: number) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.rotateTable(tableId, angle);
      syncState(state);
    },
    [syncState]
  );

  const updateTable = useCallback(
    async (tableId: string, changes: Parameters<DesignerWorkerAPI['updateTable']>[1]) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.updateTable(tableId, changes);
      syncState(state);
    },
    [syncState]
  );

  const moveSeat = useCallback(
    async (tableId: string, seatId: string, x: number, y: number) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.moveSeat(tableId, seatId, x, y);
      syncState(state);
    },
    [syncState]
  );

  const addElement = useCallback(
    async (type: Parameters<DesignerWorkerAPI['addElement']>[0], position: { x: number; y: number }) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.addElement(type, position);
      syncState(state);
    },
    [syncState]
  );

  const addFigure = useCallback(
    async (figure: Parameters<DesignerWorkerAPI['addFigure']>[0]) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.addFigure(figure);
      syncState(state);
    },
    [syncState]
  );

  const updateElement = useCallback(
    async (id: string, changes: Parameters<DesignerWorkerAPI['updateElement']>[1]) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.updateElement(id, changes);
      syncState(state);
    },
    [syncState]
  );

  const removeItems = useCallback(
    async (ids: string[]) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.removeItems(ids);
      syncState(state);
    },
    [syncState]
  );

  const duplicateItems = useCallback(
    async (ids: string[]) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.duplicateItems(ids);
      syncState(state);
    },
    [syncState]
  );

  const alignItems = useCallback(
    async (ids: string[], axis: Parameters<DesignerWorkerAPI['alignItems']>[1]) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.alignItems(ids, axis);
      syncState(state);
    },
    [syncState]
  );

  const distributeItems = useCallback(
    async (ids: string[], axis: Parameters<DesignerWorkerAPI['distributeItems']>[1]) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.distributeItems(ids, axis);
      syncState(state);
    },
    [syncState]
  );

  const arrangeItems = useCallback(
    async (
      ids: string[],
      pattern: Parameters<DesignerWorkerAPI['arrangeItems']>[1],
      roomW: number,
      roomH: number
    ) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.arrangeItems(ids, pattern, roomW, roomH);
      syncState(state);
    },
    [syncState]
  );

  const undo = useCallback(async () => {
    if (!apiRef.current) return;
    const state = await apiRef.current.undo();
    syncState(state);
  }, [syncState]);

  const redo = useCallback(async () => {
    if (!apiRef.current) return;
    const state = await apiRef.current.redo();
    syncState(state);
  }, [syncState]);

  const setRoomProperties = useCallback(
    async (props: Partial<RoomLayout>) => {
      if (!apiRef.current) return;
      const state = await apiRef.current.setRoomProperties(props);
      syncState(state);
    },
    [syncState]
  );

  const getState = useCallback(async () => {
    if (!apiRef.current) return null;
    return apiRef.current.getState();
  }, []);

  return {
    api,
    initialize,
    addTableFromPreset,
    addFreeformTable,
    moveTable,
    rotateTable,
    updateTable,
    moveSeat,
    addElement,
    addFigure,
    updateElement,
    removeItems,
    duplicateItems,
    alignItems,
    distributeItems,
    arrangeItems,
    undo,
    redo,
    setRoomProperties,
    getState,
  };
}
