import { useCallback } from 'react';
import { Group } from 'react-konva';
import type Konva from 'konva';
import type { Table } from '../../types/table';
import { useSelectionStore } from '../../store/selection-store';

import { getSeatLayout } from '../../presets/seat-layouts';
import { SeatNode } from './SeatNode';
import { TableShape } from './TableShape';
import { TableLabel } from './TableLabel';

interface TableGroupProps {
  table: Table;
  onDragEnd?: (tableId: string, x: number, y: number) => void;
}

export function TableGroup({ table, onDragEnd }: TableGroupProps) {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const select = useSelectionStore((s) => s.select);
  const toggleSelect = useSelectionStore((s) => s.toggleSelect);
  const isSelected = selectedIds.has(table.id);

  const layout = getSeatLayout(table.seatLayoutId);
  const tableShape = layout?.tableShape ?? 'round';

  // Position at center of table dimensions
  const centerX = table.x + table.width / 2;
  const centerY = table.y + table.height / 2;

  const handleClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      if (e.evt.shiftKey || e.evt.metaKey) {
        toggleSelect(table.id);
      } else {
        select(table.id);
      }
    },
    [table.id, select, toggleSelect]
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (onDragEnd) {
        // Convert from center-based position back to top-left
        onDragEnd(
          table.id,
          Math.round(e.target.x() - table.width / 2),
          Math.round(e.target.y() - table.height / 2)
        );
      }
    },
    [table.id, table.width, table.height, onDragEnd]
  );

  return (
    <Group
      x={centerX}
      y={centerY}
      rotation={table.rotation}
      draggable={!!onDragEnd}
      onClick={handleClick}
      onTap={handleClick}
      onDragEnd={handleDragEnd}
      name={`table-${table.id}`}
    >
      <TableShape
        tableShape={tableShape}
        width={table.width}
        height={table.height}
        isSelected={isSelected}
      />
      {table.seats.map((seat) => (
        <SeatNode key={seat.id} seat={seat} />
      ))}
      <TableLabel table={table} />
    </Group>
  );
}
