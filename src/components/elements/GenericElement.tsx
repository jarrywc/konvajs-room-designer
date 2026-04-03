import { Group, Rect, Circle, Ellipse, Line, Text } from 'react-konva';
import type Konva from 'konva';
import { useCallback } from 'react';
import type { RoomElement } from '../../types/room';
import { useSelectionStore } from '../../store/selection-store';

interface GenericElementProps {
  element: RoomElement;
  onDragEnd?: (id: string, x: number, y: number) => void;
  onTextDblClick?: (id: string) => void;
}

export function GenericElement({ element, onDragEnd, onTextDblClick }: GenericElementProps) {
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

  const handleDblClick = useCallback(() => {
    if (element.elementType === 'text' && onTextDblClick) {
      onTextDblClick(element.id);
    }
  }, [element.id, element.elementType, onTextDblClick]);

  const selStroke = isSelected ? '#4299E1' : element.strokeColor;
  const selStrokeWidth = isSelected ? Math.max(element.strokeWidth, 2) : element.strokeWidth;
  const fill = element.fillColor === 'transparent' ? undefined : element.fillColor;

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
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
      name={`element-${element.id}`}
    >
      {renderShape(element, selStroke, selStrokeWidth, fill)}
      {element.label && !isFigureType(element.elementType) && element.elementType !== 'text' && (
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

function isFigureType(type: string): boolean {
  return type.startsWith('figure_');
}

function renderShape(
  el: RoomElement,
  stroke: string,
  strokeWidth: number,
  fill: string | undefined
) {
  switch (el.elementType) {
    case 'text': {
      const cfg = el.config ?? {};
      return (
        <Text
          x={0}
          y={0}
          width={el.width}
          height={el.height}
          text={(cfg.text as string) ?? 'Text'}
          fontSize={(cfg.fontSize as number) ?? 16}
          fontFamily={(cfg.fontFamily as string) ?? 'sans-serif'}
          fontStyle={(cfg.fontWeight as string) ?? 'normal'}
          fill={(cfg.textColor as string) ?? '#2D3748'}
          align={(cfg.align as string) ?? 'center'}
          verticalAlign="middle"
        />
      );
    }

    case 'column':
      return (
        <Circle
          x={el.width / 2}
          y={el.height / 2}
          radius={el.width / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );

    case 'figure_rect':
      return (
        <Rect
          width={el.width}
          height={el.height}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          cornerRadius={el.cornerRadius ?? 0}
        />
      );

    case 'figure_ellipse':
      return (
        <Ellipse
          x={el.width / 2}
          y={el.height / 2}
          radiusX={el.width / 2}
          radiusY={el.height / 2}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );

    case 'figure_line':
      return (
        <Line
          points={el.points ?? [0, 0, el.width, el.height]}
          stroke={stroke}
          strokeWidth={strokeWidth}
          lineCap="round"
          hitStrokeWidth={Math.max(strokeWidth, 10)}
        />
      );

    case 'figure_polygon':
      return (
        <Line
          points={el.points ?? []}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={fill}
          closed
          lineJoin="round"
        />
      );

    case 'figure_freehand':
      return (
        <Line
          points={el.points ?? []}
          stroke={stroke}
          strokeWidth={strokeWidth}
          lineCap="round"
          lineJoin="round"
          tension={0.3}
          hitStrokeWidth={Math.max(strokeWidth, 10)}
        />
      );

    default:
      // Standard room elements (stage, bar, dance_floor, wall, door, podium, av, custom)
      return (
        <Rect
          width={el.width}
          height={el.height}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          cornerRadius={el.cornerRadius ?? (el.elementType === 'stage' ? 4 : 2)}
        />
      );
  }
}
