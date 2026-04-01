import { Group, Rect, Circle, Text } from 'react-konva';
import type Konva from 'konva';
import { useCallback } from 'react';
import type { RoomElement } from '../../types/room';
import { useSelectionStore } from '../../store/selection-store';

interface GenericElementProps {
  element: RoomElement;
  onDragEnd?: (id: string, x: number, y: number) => void;
}

export function GenericElement({ element, onDragEnd }: GenericElementProps) {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const select = useSelectionStore((s) => s.select);
  const toggleSelect = useSelectionStore((s) => s.toggleSelect);
  const isSelected = selectedIds.has(element.id);

  const handleClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      if (e.evt.shiftKey || e.evt.metaKey) {
        toggleSelect(element.id);
      } else {
        select(element.id);
      }
    },
    [element.id, select, toggleSelect]
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (onDragEnd) {
        onDragEnd(element.id, Math.round(e.target.x()), Math.round(e.target.y()));
      }
    },
    [element.id, onDragEnd]
  );

  const isCircular = element.elementType === 'column';

  return (
    <Group
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      opacity={element.opacity}
      draggable={!!onDragEnd}
      onClick={handleClick}
      onTap={handleClick}
      onDragEnd={handleDragEnd}
      name={`element-${element.id}`}
    >
      {isCircular ? (
        <Circle
          x={element.width / 2}
          y={element.height / 2}
          radius={element.width / 2}
          fill={element.fillColor}
          stroke={isSelected ? '#4299E1' : element.strokeColor}
          strokeWidth={isSelected ? 2 : element.strokeWidth}
        />
      ) : (
        <Rect
          width={element.width}
          height={element.height}
          fill={element.fillColor}
          stroke={isSelected ? '#4299E1' : element.strokeColor}
          strokeWidth={isSelected ? 2 : element.strokeWidth}
          cornerRadius={element.elementType === 'stage' ? 4 : 2}
        />
      )}
      {element.label && (
        <Text
          x={0}
          y={0}
          width={element.width}
          height={element.height}
          text={element.label}
          align="center"
          verticalAlign="middle"
          fontSize={Math.min(14, element.height * 0.4)}
          fontStyle="bold"
          fill={element.elementType === 'stage' ? '#FFFFFF' : '#2D3748'}
        />
      )}
    </Group>
  );
}
