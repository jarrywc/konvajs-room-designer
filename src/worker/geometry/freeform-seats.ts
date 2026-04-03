import type { Seat, TableShape } from '../../types/table';
import { generateId } from '../../utils/id';
import {
  SEAT_RADIUS,
  MIN_SEAT_SPACING,
  FREEFORM_SEAT_ORBIT_GAP,
  MIN_FREEFORM_SEATS,
  MAX_FREEFORM_SEATS,
} from '../../utils/constants';

export interface SeatGapOptions {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const DEFAULT_GAPS: SeatGapOptions = {
  left: FREEFORM_SEAT_ORBIT_GAP,
  right: FREEFORM_SEAT_ORBIT_GAP,
  top: FREEFORM_SEAT_ORBIT_GAP,
  bottom: FREEFORM_SEAT_ORBIT_GAP,
};

/**
 * Compute seat positions for a freeform-drawn table based on its shape and dimensions.
 * Seats are distributed evenly around the table perimeter.
 * All positions are relative to the table center (0, 0).
 */
export function computeFreeformSeats(
  shape: TableShape,
  width: number,
  height: number,
  gaps?: SeatGapOptions
): Seat[] {
  const g = gaps ?? DEFAULT_GAPS;
  switch (shape) {
    case 'round':
      return computeRoundSeats(width, height, g);
    case 'rectangle':
      return computeRectSeats(width, height, g);
    case 'oval':
      return computeOvalSeats(width, height, g);
  }
}

function clampSeatCount(count: number): number {
  return Math.max(MIN_FREEFORM_SEATS, Math.min(MAX_FREEFORM_SEATS, Math.floor(count)));
}

function makeSeat(index: number, x: number, y: number): Seat {
  return {
    id: generateId(),
    seatNumber: index + 1,
    x: Math.round(x),
    y: Math.round(y),
    radius: SEAT_RADIUS,
  };
}

function computeRoundSeats(width: number, height: number, gaps: SeatGapOptions): Seat[] {
  const tableRadius = Math.min(width, height) / 2;
  // Use average of all four gaps for round tables
  const avgGap = (gaps.left + gaps.right + gaps.top + gaps.bottom) / 4;
  const orbitRadius = tableRadius + SEAT_RADIUS + avgGap;
  const circumference = 2 * Math.PI * orbitRadius;
  const count = clampSeatCount(circumference / MIN_SEAT_SPACING);

  const seats: Seat[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    seats.push(makeSeat(i, orbitRadius * Math.cos(angle), orbitRadius * Math.sin(angle)));
  }
  return seats;
}

function computeRectSeats(width: number, height: number, gaps: SeatGapOptions): Seat[] {
  const halfW = width / 2;
  const halfH = height / 2;

  const topOffset = SEAT_RADIUS + gaps.top;
  const bottomOffset = SEAT_RADIUS + gaps.bottom;
  const leftOffset = SEAT_RADIUS + gaps.left;
  const rightOffset = SEAT_RADIUS + gaps.right;

  // Edge lengths at their respective orbit distances
  const topEdge = width + leftOffset + rightOffset;
  const bottomEdge = width + leftOffset + rightOffset;
  const leftEdge = height + topOffset + bottomOffset;
  const rightEdge = height + topOffset + bottomOffset;
  const perimeter = topEdge + bottomEdge + leftEdge + rightEdge;
  const count = clampSeatCount(perimeter / MIN_SEAT_SPACING);

  // Distribute seats proportionally along the 4 edges
  const topCount = Math.max(1, Math.round((topEdge / perimeter) * count));
  const rightCount = Math.max(1, Math.round((rightEdge / perimeter) * count));
  const bottomCount = Math.max(1, Math.round((bottomEdge / perimeter) * count));
  const leftCount = Math.max(0, count - topCount - rightCount - bottomCount);

  const seats: Seat[] = [];
  let idx = 0;

  // Top edge: left to right
  for (let i = 0; i < topCount; i++) {
    const t = topCount === 1 ? 0.5 : i / (topCount - 1);
    seats.push(makeSeat(idx++, -halfW + t * width, -(halfH + topOffset)));
  }

  // Right edge: top to bottom
  for (let i = 0; i < rightCount; i++) {
    const t = rightCount === 1 ? 0.5 : i / (rightCount - 1);
    seats.push(makeSeat(idx++, halfW + rightOffset, -halfH + t * height));
  }

  // Bottom edge: right to left
  for (let i = 0; i < bottomCount; i++) {
    const t = bottomCount === 1 ? 0.5 : i / (bottomCount - 1);
    seats.push(makeSeat(idx++, halfW - t * width, halfH + bottomOffset));
  }

  // Left edge: bottom to top
  for (let i = 0; i < leftCount; i++) {
    const t = leftCount === 1 ? 0.5 : i / (leftCount - 1);
    seats.push(makeSeat(idx++, -(halfW + leftOffset), halfH - t * height));
  }

  return seats;
}

function computeOvalSeats(width: number, height: number, gaps: SeatGapOptions): Seat[] {
  const a = width / 2; // semi-major (horizontal)
  const b = height / 2; // semi-minor (vertical)
  const hGap = SEAT_RADIUS + (gaps.left + gaps.right) / 2;
  const vGap = SEAT_RADIUS + (gaps.top + gaps.bottom) / 2;
  const orbitA = a + hGap;
  const orbitB = b + vGap;

  // Ramanujan's ellipse perimeter approximation
  const perimeter =
    Math.PI * (3 * (orbitA + orbitB) - Math.sqrt((3 * orbitA + orbitB) * (orbitA + 3 * orbitB)));
  const count = clampSeatCount(perimeter / MIN_SEAT_SPACING);

  // Distribute evenly by angle (approximate — good enough for seat placement)
  const seats: Seat[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    seats.push(makeSeat(i, orbitA * Math.cos(angle), orbitB * Math.sin(angle)));
  }
  return seats;
}
