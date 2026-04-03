import { useCallback } from 'react';
import { Circle, Rect } from 'react-konva';
import type Konva from 'konva';
import type { Seat, SeatShape } from '../../types/table';
import { useSettingsStore } from '../../store/settings-store';
import {
  SEAT_SQUARE_SIZE,
  SEAT_ROUNDED_RECT_W,
  SEAT_ROUNDED_RECT_H,
  SEAT_ROUNDED_RECT_CORNER,
} from '../../utils/constants';

interface SeatNodeProps {
  seat: Seat;
  seatShape?: SeatShape;
  draggable?: boolean;
  onSeatDragEnd?: (seatId: string, x: number, y: number) => void;
}

export function SeatNode({ seat, seatShape = 'circle', draggable, onSeatDragEnd }: SeatNodeProps) {
  const seatColor = useSettingsStore((s) => s.seatColor);

  const handleDragStart = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
  }, []);

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
      if (onSeatDragEnd) {
        onSeatDragEnd(seat.id, Math.round(e.target.x()), Math.round(e.target.y()));
      }
    },
    [seat.id, onSeatDragEnd]
  );

  const shared = {
    fill: seatColor,
    stroke: '#2B6CB0',
    strokeWidth: 1,
    draggable: !!draggable,
    listening: !!draggable,
    onDragStart: draggable ? handleDragStart : undefined,
    onDragEnd: draggable ? handleDragEnd : undefined,
    hitStrokeWidth: draggable ? 8 : 0,
  } as const;

  if (seatShape === 'square') {
    return (
      <Rect
        x={seat.x - SEAT_SQUARE_SIZE / 2}
        y={seat.y - SEAT_SQUARE_SIZE / 2}
        width={SEAT_SQUARE_SIZE}
        height={SEAT_SQUARE_SIZE}
        {...shared}
      />
    );
  }

  if (seatShape === 'rounded_rect') {
    return (
      <Rect
        x={seat.x - SEAT_ROUNDED_RECT_W / 2}
        y={seat.y - SEAT_ROUNDED_RECT_H / 2}
        width={SEAT_ROUNDED_RECT_W}
        height={SEAT_ROUNDED_RECT_H}
        cornerRadius={SEAT_ROUNDED_RECT_CORNER}
        {...shared}
      />
    );
  }

  return (
    <Circle
      x={seat.x}
      y={seat.y}
      radius={seat.radius}
      {...shared}
    />
  );
}
