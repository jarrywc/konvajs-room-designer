import { Rect, Ellipse, Circle } from 'react-konva';
import type { TableShape as TShape } from '../../types/table';
import { ROUND_TABLE_RADIUS } from '../../utils/constants';
import { useSettingsStore } from '../../store/settings-store';

interface TableShapeProps {
  tableShape: TShape;
  width: number;
  height: number;
  isSelected: boolean;
}

export function TableShape({ tableShape, width, height, isSelected }: TableShapeProps) {
  const tableColor = useSettingsStore((s) => s.tableColor);
  const selectedColor = useSettingsStore((s) => s.selectedColor);
  const fill = isSelected ? selectedColor : tableColor;
  const stroke = isSelected ? '#2B6CB0' : '#A0AEC0';
  const strokeWidth = isSelected ? 2 : 1;

  switch (tableShape) {
    case 'round':
      return (
        <Circle
          x={0}
          y={0}
          radius={ROUND_TABLE_RADIUS}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={0.6}
        />
      );
    case 'oval':
      return (
        <Ellipse
          x={0}
          y={0}
          radiusX={width / 2 - 10}
          radiusY={height / 2 - 20}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          opacity={0.6}
        />
      );
    case 'rectangle':
    default:
      return (
        <Rect
          x={-width / 2 + 20}
          y={-height / 2 + 20}
          width={width - 40}
          height={height - 40}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          cornerRadius={4}
          opacity={0.6}
        />
      );
  }
}
