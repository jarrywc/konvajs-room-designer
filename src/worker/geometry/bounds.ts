import type { BBox } from '../../types/geometry';
import type { Table } from '../../types/table';
import type { RoomElement } from '../../types/room';

export function tableBBox(t: Table): BBox {
  return { x: t.x, y: t.y, w: t.width, h: t.height };
}

export function elementBBox(el: RoomElement): BBox {
  return { x: el.x, y: el.y, w: el.width, h: el.height };
}

export function itemBBox(item: Table | RoomElement): BBox {
  if ('seats' in item) return tableBBox(item);
  return elementBBox(item);
}
