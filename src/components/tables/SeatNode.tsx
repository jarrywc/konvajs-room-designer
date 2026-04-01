import { Circle } from 'react-konva';
import type { Seat } from '../../types/table';
import { useSettingsStore } from '../../store/settings-store';

interface SeatNodeProps {
  seat: Seat;
}

export function SeatNode({ seat }: SeatNodeProps) {
  const seatColor = useSettingsStore((s) => s.seatColor);

  return (
    <Circle
      x={seat.x}
      y={seat.y}
      radius={seat.radius}
      fill={seatColor}
      stroke="#2B6CB0"
      strokeWidth={1}
      listening={false}
    />
  );
}
