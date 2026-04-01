import { Text } from 'react-konva';
import type { Table } from '../../types/table';

interface TableLabelProps {
  table: Table;
}

export function TableLabel({ table }: TableLabelProps) {
  return (
    <>
      <Text
        x={-40}
        y={-10}
        width={80}
        text={table.name}
        fontSize={11}
        fontStyle="bold"
        fill="#2D3748"
        align="center"
      />
      <Text
        x={-40}
        y={4}
        width={80}
        text={`${table.seats.length} seats`}
        fontSize={9}
        fill="#718096"
        align="center"
      />
    </>
  );
}
