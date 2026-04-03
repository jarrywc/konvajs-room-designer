import type { RoomLayout, RoomElement, RoomElementType } from '../types/room';
import type { Table, SeatLayout, TableShape } from '../types/table';
import type { Point, AlignAxis, DistributeAxis, ArrangePattern } from '../types/geometry';
import type { WorkerState } from '../types/worker-messages';
import { generateId } from '../utils/id';
import { DEFAULT_ROOM_WIDTH, DEFAULT_ROOM_HEIGHT, DEFAULT_GRID_SIZE, DEFAULT_BG_COLOR } from '../utils/constants';
import { SEAT_LAYOUTS } from '../presets/seat-layouts';
import { getTablePreset } from '../presets/table-presets';
import { getCatalogEntry } from '../presets/element-catalog';
import { computeSeatPositions } from './geometry/seat-positions';
import { computeFreeformSeats, type SeatGapOptions } from './geometry/freeform-seats';
import { snapPosition } from './geometry/snap';
import { alignBoxes, distributeBoxes, arrangeBoxes } from './geometry/alignment';
import { tableBBox, elementBBox } from './geometry/bounds';
import { createHistoryManager, type HistoryManager } from './history';

export class DesignerState {
  room: RoomLayout;
  tables: Table[];
  seatLayouts: SeatLayout[];
  private history: HistoryManager;
  private savedSnapshot: string | null = null;
  private tableCounter = 0;

  constructor() {
    this.room = this.defaultRoom();
    this.tables = [];
    this.seatLayouts = [...SEAT_LAYOUTS];
    this.history = createHistoryManager();
  }

  private defaultRoom(): RoomLayout {
    return {
      id: generateId(),
      name: 'Untitled Room',
      widthPx: DEFAULT_ROOM_WIDTH,
      heightPx: DEFAULT_ROOM_HEIGHT,
      gridSize: DEFAULT_GRID_SIZE,
      backgroundColor: DEFAULT_BG_COLOR,
      elements: [],
    };
  }

  private snapshot(): WorkerState {
    return {
      room: this.room,
      tables: this.tables,
      canUndo: this.history.canUndo(),
      canRedo: this.history.canRedo(),
      dirty: this.isDirty(),
    };
  }

  private pushUndo(): void {
    this.history.push(this.snapshot());
  }

  private restoreFromSnapshot(s: WorkerState): void {
    this.room = s.room;
    this.tables = s.tables;
  }

  private isDirty(): boolean {
    if (this.savedSnapshot === null) return this.tables.length > 0 || this.room.elements.length > 0;
    return this.dataFingerprint() !== this.savedSnapshot;
  }

  private dataFingerprint(): string {
    return JSON.stringify({ room: this.room, tables: this.tables });
  }

  // ── Initialization ──────────────────────────────────────────────

  initialize(room?: RoomLayout, tables?: Table[], seatLayouts?: SeatLayout[]): WorkerState {
    if (room) this.room = room;
    if (tables) this.tables = tables;
    if (seatLayouts) this.seatLayouts = [...SEAT_LAYOUTS, ...seatLayouts];
    this.history.clear();
    this.savedSnapshot = this.dataFingerprint();
    this.tableCounter = this.tables.length;
    return this.snapshot();
  }

  // ── Tables ──────────────────────────────────────────────────────

  addTableFromPreset(presetId: string, position: Point): WorkerState {
    const preset = getTablePreset(presetId);
    if (!preset) return this.snapshot();

    const layout = this.seatLayouts.find((l) => l.id === preset.seatLayoutId);
    if (!layout) return this.snapshot();

    this.pushUndo();
    this.tableCounter++;

    const { seats, dimensions } = computeSeatPositions(layout);
    const table: Table = {
      id: generateId(),
      name: `${preset.defaultName} ${this.tableCounter}`,
      x: Math.round(position.x - dimensions.width / 2),
      y: Math.round(position.y - dimensions.height / 2),
      rotation: 0,
      seatLayoutId: layout.id,
      seats,
      width: dimensions.width,
      height: dimensions.height,
    };

    this.tables = [...this.tables, table];
    return this.snapshot();
  }

  addFreeformTable(params: {
    tableShape: TableShape;
    x: number;
    y: number;
    width: number;
    height: number;
    seatGaps?: SeatGapOptions;
  }): WorkerState {
    this.pushUndo();
    this.tableCounter++;

    const seats = computeFreeformSeats(params.tableShape, params.width, params.height, params.seatGaps);
    const table: Table = {
      id: generateId(),
      name: `Table ${this.tableCounter}`,
      x: Math.round(params.x),
      y: Math.round(params.y),
      rotation: 0,
      seatLayoutId: 'freeform',
      tableShape: params.tableShape,
      seats,
      width: Math.round(params.width),
      height: Math.round(params.height),
    };

    this.tables = [...this.tables, table];
    return this.snapshot();
  }

  moveTable(tableId: string, x: number, y: number, snap: boolean): WorkerState {
    const idx = this.tables.findIndex((t) => t.id === tableId);
    if (idx === -1) return this.snapshot();

    this.pushUndo();
    const pos = snap ? snapPosition(x, y, this.room.gridSize) : { x: Math.round(x), y: Math.round(y) };
    const updated = { ...this.tables[idx]!, ...pos };
    this.tables = this.tables.map((t, i) => (i === idx ? updated : t));
    return this.snapshot();
  }

  rotateTable(tableId: string, angle: number): WorkerState {
    const idx = this.tables.findIndex((t) => t.id === tableId);
    if (idx === -1) return this.snapshot();

    this.pushUndo();
    const updated = { ...this.tables[idx]!, rotation: Math.round(angle * 100) / 100 };
    this.tables = this.tables.map((t, i) => (i === idx ? updated : t));
    return this.snapshot();
  }

  updateTable(tableId: string, changes: Partial<Table>): WorkerState {
    const idx = this.tables.findIndex((t) => t.id === tableId);
    if (idx === -1) return this.snapshot();

    this.pushUndo();
    const updated = { ...this.tables[idx]!, ...changes };
    this.tables = this.tables.map((t, i) => (i === idx ? updated : t));
    return this.snapshot();
  }

  moveSeat(tableId: string, seatId: string, x: number, y: number): WorkerState {
    const idx = this.tables.findIndex((t) => t.id === tableId);
    if (idx === -1) return this.snapshot();

    this.pushUndo();
    const table = this.tables[idx]!;
    const updatedSeats = table.seats.map((s) =>
      s.id === seatId ? { ...s, x: Math.round(x), y: Math.round(y), customPositioned: true } : s
    );
    this.tables = this.tables.map((t, i) =>
      i === idx ? { ...t, seats: updatedSeats } : t
    );
    return this.snapshot();
  }

  // ── Room Elements ───────────────────────────────────────────────

  addElement(type: RoomElementType, position: Point): WorkerState {
    const catalog = getCatalogEntry(type);
    if (!catalog) return this.snapshot();

    this.pushUndo();
    const el: RoomElement = {
      id: generateId(),
      elementType: type,
      label: catalog.label,
      x: Math.round(position.x - catalog.defaultWidth / 2),
      y: Math.round(position.y - catalog.defaultHeight / 2),
      width: catalog.defaultWidth,
      height: catalog.defaultHeight,
      rotation: 0,
      fillColor: catalog.defaultFill,
      strokeColor: catalog.defaultStroke,
      strokeWidth: catalog.defaultStrokeWidth,
      opacity: 1,
      isExclusion: catalog.isExclusion,
      zIndex: this.room.elements.length,
      sortOrder: this.room.elements.length,
      cornerRadius: catalog.defaultCornerRadius,
      config: type === 'text' ? {
        text: 'Text',
        fontSize: 16,
        fontFamily: 'sans-serif',
        fontWeight: 'normal',
        textColor: '#2D3748',
        align: 'center',
      } : undefined,
    };

    this.room = { ...this.room, elements: [...this.room.elements, el] };
    return this.snapshot();
  }

  addFigure(figure: {
    elementType: RoomElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    points?: number[];
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    cornerRadius?: number;
    config?: Record<string, unknown>;
  }): WorkerState {
    this.pushUndo();
    const el: RoomElement = {
      id: generateId(),
      elementType: figure.elementType,
      x: figure.x,
      y: figure.y,
      width: figure.width,
      height: figure.height,
      rotation: 0,
      fillColor: figure.fillColor,
      strokeColor: figure.strokeColor,
      strokeWidth: figure.strokeWidth,
      opacity: 1,
      isExclusion: false,
      zIndex: this.room.elements.length,
      sortOrder: this.room.elements.length,
      points: figure.points,
      cornerRadius: figure.cornerRadius,
      config: figure.config,
    };

    this.room = { ...this.room, elements: [...this.room.elements, el] };
    return this.snapshot();
  }

  updateElement(id: string, changes: Partial<RoomElement>): WorkerState {
    const idx = this.room.elements.findIndex((e) => e.id === id);
    if (idx === -1) return this.snapshot();

    this.pushUndo();
    const updated = { ...this.room.elements[idx]!, ...changes };
    this.room = {
      ...this.room,
      elements: this.room.elements.map((e, i) => (i === idx ? updated : e)),
    };
    return this.snapshot();
  }

  // ── Shared ──────────────────────────────────────────────────────

  removeItems(ids: string[]): WorkerState {
    const idSet = new Set(ids);
    const hadItems = this.tables.some((t) => idSet.has(t.id)) || this.room.elements.some((e) => idSet.has(e.id));
    if (!hadItems) return this.snapshot();

    this.pushUndo();
    this.tables = this.tables.filter((t) => !idSet.has(t.id));
    this.room = {
      ...this.room,
      elements: this.room.elements.filter((e) => !idSet.has(e.id)),
    };
    return this.snapshot();
  }

  duplicateItems(ids: string[]): WorkerState {
    const idSet = new Set(ids);
    const offset = 20;

    const newTables = this.tables
      .filter((t) => idSet.has(t.id))
      .map((t) => {
        let newSeats;
        if (t.seatLayoutId === 'freeform') {
          newSeats = t.seats.map((s) => ({ ...s, id: generateId() }));
        } else {
          const layout = this.seatLayouts.find((l) => l.id === t.seatLayoutId) ?? this.seatLayouts[0]!;
          newSeats = computeSeatPositions(layout).seats;
        }
        return { ...t, id: generateId(), x: t.x + offset, y: t.y + offset, seats: newSeats };
      });

    const newElements = this.room.elements
      .filter((e) => idSet.has(e.id))
      .map((e) => ({ ...e, id: generateId(), x: e.x + offset, y: e.y + offset }));

    if (newTables.length === 0 && newElements.length === 0) return this.snapshot();

    this.pushUndo();
    this.tables = [...this.tables, ...newTables];
    this.room = { ...this.room, elements: [...this.room.elements, ...newElements] };
    return this.snapshot();
  }

  // ── Alignment / Arrangement ─────────────────────────────────────

  alignItems(ids: string[], axis: AlignAxis): WorkerState {
    const items = this.collectItems(ids);
    if (items.length < 2) return this.snapshot();

    const boxes = items.map((item) => ('seats' in item ? tableBBox(item) : elementBBox(item)));
    const newPositions = alignBoxes(boxes, axis);

    this.pushUndo();
    this.applyPositions(ids, newPositions);
    return this.snapshot();
  }

  distributeItems(ids: string[], axis: DistributeAxis): WorkerState {
    const items = this.collectItems(ids);
    if (items.length < 3) return this.snapshot();

    const boxes = items.map((item) => ('seats' in item ? tableBBox(item) : elementBBox(item)));
    const newPositions = distributeBoxes(boxes, axis);

    this.pushUndo();
    this.applyPositions(ids, newPositions);
    return this.snapshot();
  }

  arrangeItems(ids: string[], pattern: ArrangePattern, roomW: number, roomH: number): WorkerState {
    const items = this.collectItems(ids);
    if (items.length < 2) return this.snapshot();

    const boxes = items.map((item) => ('seats' in item ? tableBBox(item) : elementBBox(item)));
    const newPositions = arrangeBoxes(boxes, pattern, roomW, roomH);

    this.pushUndo();
    this.applyPositions(ids, newPositions);
    return this.snapshot();
  }

  private collectItems(ids: string[]): (Table | RoomElement)[] {
    const items: (Table | RoomElement)[] = [];
    for (const id of ids) {
      const table = this.tables.find((t) => t.id === id);
      if (table) { items.push(table); continue; }
      const el = this.room.elements.find((e) => e.id === id);
      if (el) items.push(el);
    }
    return items;
  }

  private applyPositions(ids: string[], positions: { x: number; y: number }[]): void {
    let posIdx = 0;
    for (const id of ids) {
      const pos = positions[posIdx++];
      if (!pos) continue;

      const tableIdx = this.tables.findIndex((t) => t.id === id);
      if (tableIdx !== -1) {
        this.tables = this.tables.map((t, i) => (i === tableIdx ? { ...t, x: pos.x, y: pos.y } : t));
        continue;
      }

      const elIdx = this.room.elements.findIndex((e) => e.id === id);
      if (elIdx !== -1) {
        this.room = {
          ...this.room,
          elements: this.room.elements.map((e, i) => (i === elIdx ? { ...e, x: pos.x, y: pos.y } : e)),
        };
      }
    }
  }

  // ── History ─────────────────────────────────────────────────────

  undo(): WorkerState | null {
    const prev = this.history.undo(this.snapshot());
    if (!prev) return null;
    this.restoreFromSnapshot(prev);
    return this.snapshot();
  }

  redo(): WorkerState | null {
    const next = this.history.redo(this.snapshot());
    if (!next) return null;
    this.restoreFromSnapshot(next);
    return this.snapshot();
  }

  // ── Room Properties ─────────────────────────────────────────────

  setRoomProperties(props: Partial<RoomLayout>): WorkerState {
    this.pushUndo();
    this.room = { ...this.room, ...props };
    return this.snapshot();
  }

  // ── Export ──────────────────────────────────────────────────────

  getState(): WorkerState {
    return this.snapshot();
  }
}
