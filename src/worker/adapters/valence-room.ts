import type { RoomLayout, RoomElement, RoomElementType } from '../../types/room';

/**
 * Valence-compatible types (snake_case, numeric IDs).
 * These are standalone mirrors -- no Valence dependency.
 */
export interface ValenceRoomLayoutData {
  id: number;
  name: string;
  description?: string | null;
  width_px: number;
  height_px: number;
  boundary?: { points: number[]; closed: boolean } | null;
  focal_point_x?: number | null;
  focal_point_y?: number | null;
  focal_angle?: number | null;
  grid_size: number;
  background_color?: string | null;
  elements: ValenceRoomLayoutElementData[];
}

export interface ValenceRoomLayoutElementData {
  id?: number;
  room_layout_id?: number;
  element_type: string;
  label?: string | null;
  x: number;
  y: number;
  width?: number | null;
  height?: number | null;
  rotation: number;
  svg_path?: string | null;
  fill_color?: string | null;
  stroke_color?: string | null;
  stroke_width?: number | null;
  opacity: number;
  is_exclusion: boolean;
  z_index: number;
  config?: Record<string, unknown> | null;
  sort_order: number;
}

let nextNumericId = 1;

export function toValenceRoomLayout(room: RoomLayout): ValenceRoomLayoutData {
  return {
    id: parseInt(room.id) || nextNumericId++,
    name: room.name,
    description: room.description ?? null,
    width_px: room.widthPx,
    height_px: room.heightPx,
    boundary: room.boundary ?? null,
    focal_point_x: room.focalPoint?.x ?? null,
    focal_point_y: room.focalPoint?.y ?? null,
    focal_angle: room.focalPoint?.angle ?? null,
    grid_size: room.gridSize,
    background_color: room.backgroundColor,
    elements: room.elements.map(toValenceElement),
  };
}

function toValenceElement(el: RoomElement): ValenceRoomLayoutElementData {
  return {
    id: parseInt(el.id) || undefined,
    element_type: el.elementType,
    label: el.label ?? null,
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    rotation: el.rotation,
    svg_path: el.svgPath ?? null,
    fill_color: el.fillColor,
    stroke_color: el.strokeColor,
    stroke_width: el.strokeWidth,
    opacity: el.opacity,
    is_exclusion: el.isExclusion,
    z_index: el.zIndex,
    config: el.config ?? null,
    sort_order: el.sortOrder,
  };
}

export function fromValenceRoomLayout(data: ValenceRoomLayoutData): RoomLayout {
  return {
    id: String(data.id),
    name: data.name,
    description: data.description ?? undefined,
    widthPx: data.width_px,
    heightPx: data.height_px,
    boundary: data.boundary ?? undefined,
    focalPoint:
      data.focal_point_x != null && data.focal_point_y != null
        ? { x: data.focal_point_x, y: data.focal_point_y, angle: data.focal_angle ?? 0 }
        : undefined,
    gridSize: data.grid_size,
    backgroundColor: data.background_color ?? '#FFFFFF',
    elements: data.elements.map(fromValenceElement),
  };
}

function fromValenceElement(el: ValenceRoomLayoutElementData): RoomElement {
  return {
    id: el.id != null ? String(el.id) : String(nextNumericId++),
    elementType: el.element_type as RoomElementType,
    label: el.label ?? undefined,
    x: el.x,
    y: el.y,
    width: el.width ?? 100,
    height: el.height ?? 60,
    rotation: el.rotation,
    svgPath: el.svg_path ?? undefined,
    fillColor: el.fill_color ?? '#CBD5E0',
    strokeColor: el.stroke_color ?? '#718096',
    strokeWidth: el.stroke_width ?? 1,
    opacity: el.opacity,
    isExclusion: el.is_exclusion,
    zIndex: el.z_index,
    config: el.config ?? undefined,
    sortOrder: el.sort_order,
  };
}
