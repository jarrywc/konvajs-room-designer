import type { TablePreset } from '../types/table';

export const TABLE_PRESETS: TablePreset[] = [
  { id: 'preset-round-6', name: 'Round 6-Top', seatLayoutId: 'round-6', defaultName: 'Table', icon: 'O' },
  { id: 'preset-round-8', name: 'Round 8-Top', seatLayoutId: 'round-8', defaultName: 'Table', icon: 'O' },
  { id: 'preset-round-10', name: 'Round 10-Top', seatLayoutId: 'round-10', defaultName: 'Table', icon: 'O' },
  { id: 'preset-round-12', name: 'Round 12-Top', seatLayoutId: 'round-12', defaultName: 'Table', icon: 'O' },
  { id: 'preset-rect-6', name: 'Rectangle 6-Seat', seatLayoutId: 'rect-6', defaultName: 'Table', icon: '[]' },
  { id: 'preset-rect-8', name: 'Rectangle 8-Seat', seatLayoutId: 'rect-8', defaultName: 'Table', icon: '[]' },
  { id: 'preset-rect-10', name: 'Rectangle 10-Seat', seatLayoutId: 'rect-10', defaultName: 'Table', icon: '[]' },
  { id: 'preset-rect-12', name: 'Rectangle 12-Seat', seatLayoutId: 'rect-12', defaultName: 'Table', icon: '[]' },
  { id: 'preset-oval-8', name: 'Oval 8-Seat', seatLayoutId: 'oval-8', defaultName: 'Table', icon: '()' },
  { id: 'preset-oval-10', name: 'Oval 10-Seat', seatLayoutId: 'oval-10', defaultName: 'Table', icon: '()' },
];

export function getTablePreset(id: string): TablePreset | undefined {
  return TABLE_PRESETS.find((p) => p.id === id);
}
