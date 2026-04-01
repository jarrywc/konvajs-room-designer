import type { RoomElementType } from '../types/room';

export interface ElementCatalogEntry {
  type: RoomElementType;
  label: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultFill: string;
  defaultStroke: string;
  defaultStrokeWidth: number;
  isExclusion: boolean;
}

export const ROOM_ELEMENT_CATALOG: ElementCatalogEntry[] = [
  {
    type: 'stage',
    label: 'Stage',
    icon: 'S',
    defaultWidth: 400,
    defaultHeight: 120,
    defaultFill: '#4A5568',
    defaultStroke: '#2D3748',
    defaultStrokeWidth: 2,
    isExclusion: true,
  },
  {
    type: 'bar',
    label: 'Bar',
    icon: 'B',
    defaultWidth: 200,
    defaultHeight: 80,
    defaultFill: '#744210',
    defaultStroke: '#5D3A0E',
    defaultStrokeWidth: 2,
    isExclusion: true,
  },
  {
    type: 'dance_floor',
    label: 'Dance Floor',
    icon: 'D',
    defaultWidth: 300,
    defaultHeight: 300,
    defaultFill: '#EDF2F7',
    defaultStroke: '#A0AEC0',
    defaultStrokeWidth: 1,
    isExclusion: true,
  },
  {
    type: 'door',
    label: 'Door',
    icon: 'Dr',
    defaultWidth: 60,
    defaultHeight: 10,
    defaultFill: '#F6AD55',
    defaultStroke: '#DD6B20',
    defaultStrokeWidth: 2,
    isExclusion: false,
  },
  {
    type: 'wall',
    label: 'Wall',
    icon: 'W',
    defaultWidth: 200,
    defaultHeight: 8,
    defaultFill: 'transparent',
    defaultStroke: '#2D3748',
    defaultStrokeWidth: 4,
    isExclusion: true,
  },
  {
    type: 'column',
    label: 'Column',
    icon: 'C',
    defaultWidth: 30,
    defaultHeight: 30,
    defaultFill: '#718096',
    defaultStroke: '#4A5568',
    defaultStrokeWidth: 2,
    isExclusion: true,
  },
  {
    type: 'podium',
    label: 'Podium',
    icon: 'P',
    defaultWidth: 60,
    defaultHeight: 40,
    defaultFill: '#553C9A',
    defaultStroke: '#44337A',
    defaultStrokeWidth: 2,
    isExclusion: true,
  },
  {
    type: 'av_equipment',
    label: 'AV',
    icon: 'AV',
    defaultWidth: 40,
    defaultHeight: 40,
    defaultFill: '#2B6CB0',
    defaultStroke: '#2C5282',
    defaultStrokeWidth: 1,
    isExclusion: true,
  },
];

export function getCatalogEntry(type: RoomElementType): ElementCatalogEntry | undefined {
  return ROOM_ELEMENT_CATALOG.find((e) => e.type === type);
}
