export type RoomElementType =
  | 'stage'
  | 'bar'
  | 'dance_floor'
  | 'door'
  | 'wall'
  | 'column'
  | 'podium'
  | 'av_equipment'
  | 'custom'
  | 'text'
  // Drawn figures
  | 'figure_rect'
  | 'figure_ellipse'
  | 'figure_line'
  | 'figure_polygon'
  | 'figure_freehand';

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
  /** Flat array of [x,y,...] points relative to element origin — used by line, polygon, freehand */
  points?: number[];
  cornerRadius?: number;
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
