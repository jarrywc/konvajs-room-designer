export type RoomElementType =
  | 'stage'
  | 'bar'
  | 'dance_floor'
  | 'door'
  | 'wall'
  | 'column'
  | 'podium'
  | 'av_equipment'
  | 'custom';

export interface RoomElement {
  id: string;
  elementType: RoomElementType;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  svgPath?: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  isExclusion: boolean;
  zIndex: number;
  config?: Record<string, unknown>;
  sortOrder: number;
}

export interface RoomLayout {
  id: string;
  name: string;
  description?: string;
  widthPx: number;
  heightPx: number;
  boundary?: { points: number[]; closed: boolean };
  focalPoint?: { x: number; y: number; angle: number };
  gridSize: number;
  backgroundColor: string;
  elements: RoomElement[];
}
