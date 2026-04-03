import type { Seat } from '../../types/table';

/**
 * Valence-compatible Seat (canvas representation).
 */
export interface ValenceSeat {
  id: string;
  eventId: string;
  tableId?: string;
  tableName?: string;
  sfId: string | null;
  x: number;
  y: number;
  radius: number;
  seatNumber: number;
  capacity: number;
  shape?: 'circle' | 'square';
  isOverflow?: boolean;
}

export function toValenceSeat(
  seat: Seat,
  tableId: string,
  tableName: string,
  eventId: string = ''
): ValenceSeat {
  return {
    id: seat.id,
    eventId,
    tableId,
    tableName,
    sfId: null,
    x: seat.x,
    y: seat.y,
    radius: seat.radius,
    seatNumber: seat.seatNumber,
    capacity: 1,
    shape: 'circle',
    isOverflow: false,
  };
}

export function fromValenceSeat(vs: ValenceSeat): Seat {
  return {
    id: vs.id,
    seatNumber: vs.seatNumber,
    x: vs.x,
    y: vs.y,
    radius: vs.radius,
  };
}
