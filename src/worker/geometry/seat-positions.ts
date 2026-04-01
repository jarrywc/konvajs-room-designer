import type { SeatLayout, Seat } from '../../types/table';
import { generateId } from '../../utils/id';
import {
  SEAT_RADIUS,
  ROUND_TABLE_RADIUS,
  ROUND_SEAT_ORBIT_GAP,
  TABLE_CARD_SEAT_W,
  TABLE_CARD_SEAT_H,
  TABLE_CARD_CENTER_W,
  TABLE_CARD_COL_GAP,
  TABLE_CARD_SEAT_GAP,
  TABLE_CARD_PAD_X,
  TABLE_CARD_HEADER,
  TABLE_CARD_BOTTOM_PAD,
  TABLE_CARD_W,
} from '../../utils/constants';

interface TableDimensions {
  width: number;
  height: number;
}

/**
 * Compute seat positions around a table based on its seat layout.
 * Positions are relative to the table's origin (0, 0).
 *
 * For round tables: seats evenly distributed on a circle.
 * For rectangular/oval tables: seats distributed along edges
 * matching Valence's left/right/top/bottom counts.
 */
export function computeSeatPositions(
  layout: SeatLayout
): { seats: Seat[]; dimensions: TableDimensions } {
  if (layout.tableShape === 'round') {
    return computeRoundSeats(layout);
  }
  return computeRectangularSeats(layout);
}

function computeRoundSeats(
  layout: SeatLayout
): { seats: Seat[]; dimensions: TableDimensions } {
  const { seatCount } = layout;
  const orbitRadius = ROUND_TABLE_RADIUS + SEAT_RADIUS + ROUND_SEAT_ORBIT_GAP;
  const totalSize = (orbitRadius + SEAT_RADIUS) * 2;

  const seats: Seat[] = [];
  for (let i = 0; i < seatCount; i++) {
    const angle = (2 * Math.PI * i) / seatCount - Math.PI / 2;
    seats.push({
      id: generateId(),
      seatNumber: i + 1,
      x: Math.round(orbitRadius * Math.cos(angle)),
      y: Math.round(orbitRadius * Math.sin(angle)),
      radius: SEAT_RADIUS,
    });
  }

  return { seats, dimensions: { width: totalSize, height: totalSize } };
}

function computeRectangularSeats(
  layout: SeatLayout
): { seats: Seat[]; dimensions: TableDimensions } {
  const { leftCount, rightCount, topCount, bottomCount } = layout;
  const seats: Seat[] = [];
  let seatNum = 1;

  // Dimensions matching Valence tableCardLayout
  const numSideRows = Math.max(leftCount, rightCount);
  const seatRowsHeight =
    numSideRows > 0 ? numSideRows * (TABLE_CARD_SEAT_H + TABLE_CARD_SEAT_GAP) - TABLE_CARD_SEAT_GAP : 0;
  const topCapHeight = topCount > 0 ? TABLE_CARD_SEAT_H + TABLE_CARD_SEAT_GAP : 0;
  const bottomCapHeight = bottomCount > 0 ? TABLE_CARD_SEAT_GAP + TABLE_CARD_SEAT_H : 0;

  const cardW = TABLE_CARD_W;
  const cardH = TABLE_CARD_HEADER + topCapHeight + seatRowsHeight + bottomCapHeight + TABLE_CARD_BOTTOM_PAD;

  // Origin at center of card
  const originX = cardW / 2;
  const originY = cardH / 2;

  // Column x positions relative to card origin
  const leftColX = TABLE_CARD_PAD_X + TABLE_CARD_SEAT_W / 2 - originX;
  const rightColX =
    TABLE_CARD_PAD_X + TABLE_CARD_SEAT_W + TABLE_CARD_COL_GAP + TABLE_CARD_CENTER_W + TABLE_CARD_COL_GAP + TABLE_CARD_SEAT_W / 2 - originX;

  const sideRowsTop = TABLE_CARD_HEADER + topCapHeight - originY;

  // Top end-cap seats
  const endcapW = TABLE_CARD_CENTER_W;
  if (topCount > 0) {
    const topRowY = TABLE_CARD_HEADER - originY + TABLE_CARD_SEAT_H / 2;
    const totalTopW = topCount * endcapW + (topCount - 1) * TABLE_CARD_SEAT_GAP;
    const startX = -totalTopW / 2;
    for (let i = 0; i < topCount; i++) {
      seats.push({
        id: generateId(),
        seatNumber: seatNum++,
        x: Math.round(startX + i * (endcapW + TABLE_CARD_SEAT_GAP) + endcapW / 2),
        y: Math.round(topRowY),
        radius: SEAT_RADIUS,
      });
    }
  }

  // Left column seats
  for (let i = 0; i < leftCount; i++) {
    seats.push({
      id: generateId(),
      seatNumber: seatNum++,
      x: Math.round(leftColX),
      y: Math.round(sideRowsTop + i * (TABLE_CARD_SEAT_H + TABLE_CARD_SEAT_GAP) + TABLE_CARD_SEAT_H / 2),
      radius: SEAT_RADIUS,
    });
  }

  // Right column seats
  for (let i = 0; i < rightCount; i++) {
    seats.push({
      id: generateId(),
      seatNumber: seatNum++,
      x: Math.round(rightColX),
      y: Math.round(sideRowsTop + i * (TABLE_CARD_SEAT_H + TABLE_CARD_SEAT_GAP) + TABLE_CARD_SEAT_H / 2),
      radius: SEAT_RADIUS,
    });
  }

  // Bottom end-cap seats
  if (bottomCount > 0) {
    const bottomRowY = sideRowsTop + seatRowsHeight + TABLE_CARD_SEAT_GAP + TABLE_CARD_SEAT_H / 2;
    const totalBotW = bottomCount * endcapW + (bottomCount - 1) * TABLE_CARD_SEAT_GAP;
    const startX = -totalBotW / 2;
    for (let i = 0; i < bottomCount; i++) {
      seats.push({
        id: generateId(),
        seatNumber: seatNum++,
        x: Math.round(startX + i * (endcapW + TABLE_CARD_SEAT_GAP) + endcapW / 2),
        y: Math.round(bottomRowY),
        radius: SEAT_RADIUS,
      });
    }
  }

  return { seats, dimensions: { width: cardW, height: cardH } };
}
