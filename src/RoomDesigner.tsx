import { useEffect, useCallback, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import type Konva from 'konva';
import type { RoomLayout, RoomElementType, RoomElement } from './types/room';
import type { Table, SeatLayout } from './types/table';
import type { WorkerState } from './types/worker-messages';
import type { AlignAxis, DistributeAxis, ArrangePattern } from './types/geometry';
import { useWorker } from './bridge/useWorker';
import { useRenderStore } from './store/render-store';
import { useCanvasStore } from './store/canvas-store';
import { useSelectionStore } from './store/selection-store';
import { useSettingsStore } from './store/settings-store';
import { DesignerStage } from './canvas/DesignerStage';
import { TableGroup } from './components/tables/TableGroup';
import { GenericElement } from './components/elements/GenericElement';
import { Sidebar } from './components/sidebar/Sidebar';
import { Toolbar } from './components/toolbar/Toolbar';
import { ContextMenu, type ContextMenuItem } from './components/shared/ContextMenu';
import { DrawToolbar } from './components/toolbar/DrawToolbar';
import type { DrawnFigure, DrawnTable } from './canvas/DrawingLayer';
import { TextEditOverlay } from './components/elements/TextEditOverlay';

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
      onChange,
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
    const stageRef = useRef<Konva.Stage>(null);
    const transformerRef = useRef<Konva.Transformer>(null);

    // Context menu state
    const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

    // Text editing state
    const [editingTextId, setEditingTextId] = useState<string | null>(null);

    // Track onChange
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // Sidebar width
    const sidebarWidth = readOnly ? 0 : 220;
    const canvasWidth = width - sidebarWidth;
    const canvasHeight = height - 36;

    // Initialize worker on mount
    useEffect(() => {
      if (initRef.current) return;
      initRef.current = true;
      worker.initialize(initialRoom, initialTables, seatLayouts);
    }, []);

    // Sync onChange callback
    useEffect(() => {
      const unsub = useRenderStore.subscribe((state) => {
        if (onChangeRef.current && state.dirty) {
          onChangeRef.current({
            room: state.room,
            tables: state.tables,
            canUndo: state.canUndo,
            canRedo: state.canRedo,
            dirty: state.dirty,
          });
        }
      });
      return unsub;
    }, []);

    // Attach transformer to selected element nodes
    useEffect(() => {
      const tr = transformerRef.current;
      const stage = stageRef.current;
      if (!tr || !stage || readOnly) { tr?.nodes([]); return; }

      const nodes: Konva.Node[] = [];
      for (const id of selectedIds) {
        const elNode = stage.findOne(`.element-${id}`);
        if (elNode) nodes.push(elNode);
      }
      tr.nodes(nodes);
      tr.getLayer()?.batchDraw();
    }, [selectedIds, room.elements, readOnly]);

    // Imperative handle
    useImperativeHandle(ref, () => ({
      getState: () => worker.getState(),
      zoomToFit: () => zoomToFit(room.widthPx, room.heightPx, canvasWidth, canvasHeight),
      undo: () => worker.undo(),
      redo: () => worker.redo(),
    }));

    // ── Coordinate conversion ────────────────────────────────────
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    /** Convert a screen (clientX, clientY) to canvas-space coordinates */
    const screenToCanvas = useCallback(
      (clientX: number, clientY: number) => {
        const rect = canvasContainerRef.current?.getBoundingClientRect();
        if (!rect) return null;
        const { scale, position } = useCanvasStore.getState();
        const x = (clientX - rect.left - position.x) / scale;
        const y = (clientY - rect.top - position.y) / scale;
        return { x, y };
      },
      []
    );

    /** Get the center of the current viewport in canvas coordinates */
    const getViewportCenter = useCallback(() => {
      const { scale, position } = useCanvasStore.getState();
      return {
        x: (canvasWidth / 2 - position.x) / scale,
        y: (canvasHeight / 2 - position.y) / scale,
      };
    }, [canvasWidth, canvasHeight]);

    // ── Callbacks ─────────────────────────────────────────────────

    const handleAddTable = useCallback(
      (presetId: string) => {
        const pos = getViewportCenter();
        worker.addTableFromPreset(presetId, pos);
      },
      [worker, getViewportCenter]
    );

    const handleAddElement = useCallback(
      (type: RoomElementType) => {
        const pos = getViewportCenter();
        worker.addElement(type, pos);
      },
      [worker, getViewportCenter]
    );

    // ── HTML5 drag-and-drop onto canvas ───────────────────────────

    const handleDragOver = useCallback((e: React.DragEvent) => {
      if (
        e.dataTransfer.types.includes('application/room-designer-table') ||
        e.dataTransfer.types.includes('application/room-designer-element')
      ) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        const pos = screenToCanvas(e.clientX, e.clientY);
        if (!pos) return;

        const tablePresetId = e.dataTransfer.getData('application/room-designer-table');
        if (tablePresetId) {
          worker.addTableFromPreset(tablePresetId, pos);
          return;
        }

        const elementType = e.dataTransfer.getData('application/room-designer-element');
        if (elementType) {
          worker.addElement(elementType as RoomElementType, pos);
        }
      },
      [worker, screenToCanvas]
    );

    // ── Figure drawing completion ───────────────────────────────────

    const handleFigureComplete = useCallback(
      (figure: DrawnFigure) => {
        worker.addFigure(figure);
      },
      [worker]
    );

    const handleTableComplete = useCallback(
      (drawnTable: DrawnTable) => {
        const seatGaps = useSettingsStore.getState().seatGaps;
        worker.addFreeformTable({ ...drawnTable, seatGaps });
      },
      [worker]
    );

    const handleSeatDragEnd = useCallback(
      (tableId: string, seatId: string, x: number, y: number) => {
        worker.moveSeat(tableId, seatId, x, y);
      },
      [worker]
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

    const handleUpdateElement = useCallback(
      (id: string, changes: Partial<RoomElement>) => {
        worker.updateElement(id, changes);
      },
      [worker]
    );

    const handleTransformEnd = useCallback(
      () => {
        const nodes = transformerRef.current?.nodes() ?? [];
        for (const node of nodes) {
          const name = node.name();
          const match = name.match(/^element-(.+)$/);
          if (!match) continue;
          const id = match[1]!;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          const el = room.elements.find((e) => e.id === id);
          if (!el) continue;

          const newWidth = Math.round(el.width * scaleX);
          const newHeight = Math.round(el.height * scaleY);

          // Reset scale so Konva doesn't double-apply it
          node.scaleX(1);
          node.scaleY(1);

          worker.updateElement(id, {
            x: Math.round(node.x()),
            y: Math.round(node.y()),
            width: newWidth,
            height: newHeight,
            rotation: Math.round(node.rotation()),
          });
        }
      },
      [worker, room.elements]
    );

    const handleRotateTable = useCallback(
      (tableId: string, angle: number) => {
        worker.rotateTable(tableId, angle);
      },
      [worker]
    );

    const handleUpdateTable = useCallback(
      (tableId: string, changes: Partial<Table>) => {
        worker.updateTable(tableId, changes);
      },
      [worker]
    );

    const handleTextDblClick = useCallback(
      (elementId: string) => {
        if (!readOnly) setEditingTextId(elementId);
      },
      [readOnly]
    );

    const handleTextCommit = useCallback(
      (id: string, text: string) => {
        const el = room.elements.find((e) => e.id === id);
        if (el) {
          worker.updateElement(id, { config: { ...el.config, text } });
        }
        setEditingTextId(null);
      },
      [worker, room.elements]
    );

    const handleTextCancel = useCallback(() => {
      setEditingTextId(null);
    }, []);

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

    const handleAlign = useCallback(
      (ids: string[], axis: AlignAxis) => worker.alignItems(ids, axis),
      [worker]
    );

    const handleDistribute = useCallback(
      (ids: string[], axis: DistributeAxis) => worker.distributeItems(ids, axis),
      [worker]
    );

    const handleArrange = useCallback(
      (ids: string[], pattern: ArrangePattern) =>
        worker.arrangeItems(ids, pattern, room.widthPx, room.heightPx),
      [worker, room.widthPx, room.heightPx]
    );

    const handleSetRoomProperties = useCallback(
      (props: Record<string, unknown>) => {
        worker.setRoomProperties(props as Partial<RoomLayout>);
      },
      [worker]
    );

    const handleSave = useCallback(async () => {
      if (onSave) {
        const state = await worker.getState();
        if (state) onSave(state);
      }
    }, [worker, onSave]);

    const handleUndo = useCallback(() => worker.undo(), [worker]);
    const handleRedo = useCallback(() => worker.redo(), [worker]);

    // ── Context menu ──────────────────────────────────────────────
    const handleContextMenu = useCallback(
      (e: React.MouseEvent) => {
        if (readOnly) return;
        e.preventDefault();
        setCtxMenu({ x: e.clientX, y: e.clientY });
      },
      [readOnly]
    );

    const contextItems: ContextMenuItem[] = [
      { label: 'Delete', action: handleDelete, disabled: selectedIds.size === 0 },
      { label: 'Duplicate', action: handleDuplicate, disabled: selectedIds.size === 0 },
      { label: '', action: () => {}, separator: true },
      { label: 'Select All', action: () => {
        const allIds = [...tables.map((t) => t.id), ...room.elements.map((e) => e.id)];
        useSelectionStore.getState().selectMultiple(allIds);
      }},
      { label: 'Clear Selection', action: clearSelection },
    ];

    // ── Keyboard shortcuts ────────────────────────────────────────
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (readOnly) return;

        // Ignore when typing in inputs
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

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
        if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
          e.preventDefault();
          const allIds = [...tables.map((t) => t.id), ...room.elements.map((e) => e.id)];
          useSelectionStore.getState().selectMultiple(allIds);
          return;
        }
        if (e.key === 'Escape') {
          clearSelection();
          setCtxMenu(null);
          useCanvasStore.getState().setActiveTool('select');
        }
        // Drawing tool shortcuts
        const toolKeys: Record<string, string> = {
          v: 'select', r: 'rect', e: 'ellipse', l: 'line', p: 'polygon', f: 'freehand', t: 'text',
          '1': 'draw_round_table', '2': 'draw_rect_table', '3': 'draw_oval_table',
        };
        if (!e.metaKey && !e.ctrlKey && toolKeys[e.key]) {
          useCanvasStore.getState().setActiveTool(toolKeys[e.key] as import('./store/canvas-store').DrawingTool);
          return;
        }
        // Arrow keys: nudge selected items
        const nudge = e.shiftKey ? 10 : 1;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedIds.size > 0) {
          e.preventDefault();
          for (const id of selectedIds) {
            const table = tables.find((t) => t.id === id);
            if (table) {
              const dx = e.key === 'ArrowRight' ? nudge : e.key === 'ArrowLeft' ? -nudge : 0;
              const dy = e.key === 'ArrowDown' ? nudge : e.key === 'ArrowUp' ? -nudge : 0;
              worker.moveTable(id, table.x + dx, table.y + dy, false);
            }
            const el = room.elements.find((el) => el.id === id);
            if (el) {
              const dx = e.key === 'ArrowRight' ? nudge : e.key === 'ArrowLeft' ? -nudge : 0;
              const dy = e.key === 'ArrowDown' ? nudge : e.key === 'ArrowUp' ? -nudge : 0;
              worker.updateElement(id, { x: el.x + dx, y: el.y + dy });
            }
          }
        }
      };

      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }, [worker, selectedIds, tables, room.elements, readOnly, handleDelete, handleDuplicate, clearSelection]);

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
          position: 'relative',
        }}
        onContextMenu={handleContextMenu}
      >
        <Toolbar
          onUndo={handleUndo}
          onRedo={handleRedo}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onSave={onSave ? handleSave : undefined}
          onDiscard={onDiscard}
        >
          {!readOnly && <DrawToolbar />}
        </Toolbar>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {!readOnly && (
            <Sidebar
              onAddTable={handleAddTable}
              onAddElement={handleAddElement}
              onUpdateElement={handleUpdateElement}
              onRotateTable={handleRotateTable}
              onUpdateTable={handleUpdateTable}
              onAlign={handleAlign}
              onDistribute={handleDistribute}
              onArrange={handleArrange}
              onSetRoomProperties={handleSetRoomProperties}
            />
          )}
          <div
            ref={canvasContainerRef}
            style={{ flex: 1, background: '#F7FAFC' }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <DesignerStage
              width={canvasWidth}
              height={canvasHeight}
              stageRef={stageRef}
              transformerRef={readOnly ? undefined : transformerRef}
              onTransformEnd={readOnly ? undefined : handleTransformEnd}
              onFigureComplete={readOnly ? undefined : handleFigureComplete}
              onTableComplete={readOnly ? undefined : handleTableComplete}
            >
              {room.elements.map((el) => (
                <GenericElement
                  key={el.id}
                  element={el}
                  onDragEnd={readOnly ? undefined : handleElementDragEnd}
                  onTextDblClick={readOnly ? undefined : handleTextDblClick}
                />
              ))}
              {tables.map((table) => (
                <TableGroup
                  key={table.id}
                  table={table}
                  onDragEnd={readOnly ? undefined : handleTableDragEnd}
                  onSeatDragEnd={readOnly ? undefined : handleSeatDragEnd}
                />
              ))}
            </DesignerStage>
          </div>
        </div>

        {ctxMenu && (
          <ContextMenu
            x={ctxMenu.x}
            y={ctxMenu.y}
            items={contextItems}
            onClose={() => setCtxMenu(null)}
          />
        )}

        {editingTextId && (() => {
          const el = room.elements.find((e) => e.id === editingTextId);
          if (!el) return null;
          return (
            <TextEditOverlay
              element={el}
              canvasContainerRef={canvasContainerRef}
              onCommit={handleTextCommit}
              onCancel={handleTextCancel}
            />
          );
        })()}
      </div>
    );
  }
);
