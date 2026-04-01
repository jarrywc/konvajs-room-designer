import { useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import type { RoomLayout, RoomElementType } from './types/room';
import type { Table, SeatLayout } from './types/table';
import type { WorkerState } from './types/worker-messages';
import { useWorker } from './bridge/useWorker';
import { useRenderStore } from './store/render-store';
import { useCanvasStore } from './store/canvas-store';
import { useSelectionStore } from './store/selection-store';
import { DesignerStage } from './canvas/DesignerStage';
import { TableGroup } from './components/tables/TableGroup';
import { GenericElement } from './components/elements/GenericElement';
import { Sidebar } from './components/sidebar/Sidebar';
import { Toolbar } from './components/toolbar/Toolbar';

export interface RoomDesignerProps {
  initialRoom?: RoomLayout;
  initialTables?: Table[];
  seatLayouts?: SeatLayout[];
  onSave?: (state: WorkerState) => void;
  onChange?: (state: WorkerState) => void;
  onDiscard?: () => void;
  width?: number;
  height?: number;
  readOnly?: boolean;
}

export interface RoomDesignerHandle {
  getState(): Promise<WorkerState | null>;
  zoomToFit(): void;
  undo(): void;
  redo(): void;
}

export const RoomDesigner = forwardRef<RoomDesignerHandle, RoomDesignerProps>(
  function RoomDesigner(
    {
      initialRoom,
      initialTables,
      seatLayouts,
      onSave,
      onChange: _onChange,
      onDiscard,
      width = 1200,
      height = 800,
      readOnly = false,
    },
    ref
  ) {
    const worker = useWorker();
    const tables = useRenderStore((s) => s.tables);
    const room = useRenderStore((s) => s.room);
    const selectedIds = useSelectionStore((s) => s.selectedIds);
    const clearSelection = useSelectionStore((s) => s.clearSelection);
    const zoomToFit = useCanvasStore((s) => s.zoomToFit);
    const snapToGrid = useCanvasStore((s) => s.snapToGrid);
    const initRef = useRef(false);

    // Initialize worker on mount
    useEffect(() => {
      if (initRef.current) return;
      initRef.current = true;
      worker.initialize(initialRoom, initialTables, seatLayouts);
    }, []);

    // Imperative handle
    useImperativeHandle(ref, () => ({
      getState: () => worker.getState(),
      zoomToFit: () => zoomToFit(room.widthPx, room.heightPx, canvasWidth, canvasHeight),
      undo: () => worker.undo(),
      redo: () => worker.redo(),
    }));

    // Sidebar width
    const sidebarWidth = readOnly ? 0 : 220;
    const canvasWidth = width - sidebarWidth;
    const canvasHeight = height - 36; // toolbar height

    // ── Callbacks ─────────────────────────────────────────────────

    const handleAddTable = useCallback(
      (presetId: string) => {
        const scale = useCanvasStore.getState().scale;
        const pos = useCanvasStore.getState().position;
        // Place at center of current viewport
        const centerX = (canvasWidth / 2 - pos.x) / scale;
        const centerY = (canvasHeight / 2 - pos.y) / scale;
        worker.addTableFromPreset(presetId, { x: centerX, y: centerY });
      },
      [worker, canvasWidth, canvasHeight]
    );

    const handleAddElement = useCallback(
      (type: RoomElementType) => {
        const scale = useCanvasStore.getState().scale;
        const pos = useCanvasStore.getState().position;
        const centerX = (canvasWidth / 2 - pos.x) / scale;
        const centerY = (canvasHeight / 2 - pos.y) / scale;
        worker.addElement(type, { x: centerX, y: centerY });
      },
      [worker, canvasWidth, canvasHeight]
    );

    const handleTableDragEnd = useCallback(
      (tableId: string, x: number, y: number) => {
        worker.moveTable(tableId, x, y, snapToGrid);
      },
      [worker, snapToGrid]
    );

    const handleElementDragEnd = useCallback(
      (id: string, x: number, y: number) => {
        worker.updateElement(id, { x, y });
      },
      [worker]
    );

    const handleDelete = useCallback(() => {
      if (selectedIds.size > 0) {
        worker.removeItems([...selectedIds]);
        clearSelection();
      }
    }, [worker, selectedIds, clearSelection]);

    const handleDuplicate = useCallback(() => {
      if (selectedIds.size > 0) {
        worker.duplicateItems([...selectedIds]);
      }
    }, [worker, selectedIds]);

    const handleSave = useCallback(async () => {
      if (onSave) {
        const state = await worker.getState();
        if (state) onSave(state);
      }
    }, [worker, onSave]);

    const handleUndo = useCallback(() => worker.undo(), [worker]);
    const handleRedo = useCallback(() => worker.redo(), [worker]);

    // ── Keyboard shortcuts ────────────────────────────────────────
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (readOnly) return;

        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) worker.redo();
          else worker.undo();
          return;
        }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selectedIds.size > 0) {
            e.preventDefault();
            handleDelete();
          }
          return;
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
          e.preventDefault();
          handleDuplicate();
          return;
        }
        if (e.key === 'Escape') {
          clearSelection();
        }
      };

      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }, [worker, selectedIds, readOnly, handleDelete, handleDuplicate, clearSelection]);

    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          borderRadius: 6,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <Toolbar
          onUndo={handleUndo}
          onRedo={handleRedo}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onSave={onSave ? handleSave : undefined}
          onDiscard={onDiscard}
        />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {!readOnly && (
            <Sidebar onAddTable={handleAddTable} onAddElement={handleAddElement} />
          )}
          <div style={{ flex: 1, background: '#F7FAFC' }}>
            <DesignerStage width={canvasWidth} height={canvasHeight}>
              {/* Room elements */}
              {room.elements.map((el) => (
                <GenericElement
                  key={el.id}
                  element={el}
                  onDragEnd={readOnly ? undefined : handleElementDragEnd}
                />
              ))}
              {/* Tables */}
              {tables.map((table) => (
                <TableGroup
                  key={table.id}
                  table={table}
                  onDragEnd={readOnly ? undefined : handleTableDragEnd}
                />
              ))}
            </DesignerStage>
          </div>
        </div>
      </div>
    );
  }
);
