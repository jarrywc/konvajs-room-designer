import { Rect } from 'react-konva';

interface SelectionRectProps {
  rect: { x: number; y: number; w: number; h: number } | null;
}

export function SelectionRect({ rect }: SelectionRectProps) {
  if (!rect) return null;

  return (
    <Rect
      x={rect.x}
      y={rect.y}
      width={rect.w}
      height={rect.h}
      fill="rgba(66, 153, 225, 0.15)"
      stroke="#4299E1"
      strokeWidth={1}
      listening={false}
    />
  );
}
