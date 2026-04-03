import type { Table } from '../../types/table';

/**
 * Valence-compatible PlanTableData (subset).
 */
export interface ValencePlanTableData {
  id: number;
  name: string;
  event_id?: string;
  seating_count: number;
  position_x: number;
  position_y: number;
  rotation?: number;
  is_active: boolean;
  sort_order: number;
  section?: string | null;
  room?: string | null;
  type?: string | null;
  seat_count?: number;
  slot_col?: number | null;
  slot_row?: number | null;
  notes?: string | null;
  number?: string | null;
}

let nextTableId = 1;

export function toValencePlanTable(table: Table, sortOrder: number = 0): ValencePlanTableData {
  return {
    id: parseInt(table.id) || nextTableId++,
    name: table.name,
    seating_count: table.seats.length,
    position_x: table.x,
    position_y: table.y,
    rotation: table.rotation,
    is_active: true,
    sort_order: sortOrder,
    seat_count: table.seats.length,
  };
}

export function fromValencePlanTable(data: ValencePlanTableData): Partial<Table> {
  return {
    id: String(data.id),
    name: data.name,
    x: data.position_x,
    y: data.position_y,
    rotation: data.rotation ?? 0,
  };
}
