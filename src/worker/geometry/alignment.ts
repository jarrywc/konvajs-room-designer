import type { BBox, AlignAxis, DistributeAxis, ArrangePattern } from '../../types/geometry';

export function alignBoxes(boxes: BBox[], axis: AlignAxis): { x: number; y: number }[] {
  if (boxes.length < 2) return boxes.map((b) => ({ x: b.x, y: b.y }));

  let target: number;
  switch (axis) {
    case 'left':
      target = Math.min(...boxes.map((b) => b.x));
      break;
    case 'right':
      target = Math.max(...boxes.map((b) => b.x + b.w));
      break;
    case 'center-h': {
      const mn = Math.min(...boxes.map((b) => b.x));
      const mx = Math.max(...boxes.map((b) => b.x + b.w));
      target = (mn + mx) / 2;
      break;
    }
    case 'top':
      target = Math.min(...boxes.map((b) => b.y));
      break;
    case 'bottom':
      target = Math.max(...boxes.map((b) => b.y + b.h));
      break;
    case 'center-v': {
      const mn = Math.min(...boxes.map((b) => b.y));
      const mx = Math.max(...boxes.map((b) => b.y + b.h));
      target = (mn + mx) / 2;
      break;
    }
  }

  return boxes.map((b) => {
    switch (axis) {
      case 'left':
        return { x: target, y: b.y };
      case 'right':
        return { x: target - b.w, y: b.y };
      case 'center-h':
        return { x: Math.round(target - b.w / 2), y: b.y };
      case 'top':
        return { x: b.x, y: target };
      case 'bottom':
        return { x: b.x, y: target - b.h };
      case 'center-v':
        return { x: b.x, y: Math.round(target - b.h / 2) };
    }
  });
}

export function distributeBoxes(boxes: BBox[], axis: DistributeAxis): { x: number; y: number }[] {
  if (boxes.length < 3) return boxes.map((b) => ({ x: b.x, y: b.y }));
  const isH = axis === 'horizontal';

  const indices = boxes
    .map((_, i) => i)
    .sort((a, b) => (isH ? boxes[a]!.x - boxes[b]!.x : boxes[a]!.y - boxes[b]!.y));

  const first = indices[0]!;
  const last = indices[indices.length - 1]!;
  const start = isH ? boxes[first]!.x : boxes[first]!.y;
  const end = isH ? boxes[last]!.x + boxes[last]!.w : boxes[last]!.y + boxes[last]!.h;
  const totalSize = indices.reduce((s, i) => s + (isH ? boxes[i]!.w : boxes[i]!.h), 0);
  const gap = (end - start - totalSize) / (indices.length - 1);

  const result = boxes.map((b) => ({ x: b.x, y: b.y }));
  let cursor = start;
  for (const idx of indices) {
    const b = boxes[idx]!;
    if (isH) {
      result[idx] = { x: Math.round(cursor), y: b.y };
      cursor += b.w + gap;
    } else {
      result[idx] = { x: b.x, y: Math.round(cursor) };
      cursor += b.h + gap;
    }
  }
  return result;
}

export function arrangeBoxes(
  boxes: BBox[],
  pattern: ArrangePattern,
  roomW: number,
  roomH: number
): { x: number; y: number }[] {
  if (boxes.length < 2) return boxes.map((b) => ({ x: b.x, y: b.y }));
  const n = boxes.length;
  const margin = 40;

  switch (pattern) {
    case 'diagonal-tl': {
      const sX = (roomW - margin * 2 - boxes[n - 1]!.w) / Math.max(n - 1, 1);
      const sY = (roomH - margin * 2 - boxes[n - 1]!.h) / Math.max(n - 1, 1);
      return boxes.map((_, i) => ({
        x: Math.round(margin + i * sX),
        y: Math.round(margin + i * sY),
      }));
    }
    case 'diagonal-tr': {
      const sX = (roomW - margin * 2 - boxes[n - 1]!.w) / Math.max(n - 1, 1);
      const sY = (roomH - margin * 2 - boxes[n - 1]!.h) / Math.max(n - 1, 1);
      return boxes.map((b, i) => ({
        x: Math.round(roomW - margin - b.w - i * sX),
        y: Math.round(margin + i * sY),
      }));
    }
    case 'diagonal-bl': {
      const sX = (roomW - margin * 2 - boxes[n - 1]!.w) / Math.max(n - 1, 1);
      const sY = (roomH - margin * 2 - boxes[n - 1]!.h) / Math.max(n - 1, 1);
      return boxes.map((b, i) => ({
        x: Math.round(margin + i * sX),
        y: Math.round(roomH - margin - b.h - i * sY),
      }));
    }
    case 'diagonal-br': {
      const sX = (roomW - margin * 2 - boxes[n - 1]!.w) / Math.max(n - 1, 1);
      const sY = (roomH - margin * 2 - boxes[n - 1]!.h) / Math.max(n - 1, 1);
      return boxes.map((b, i) => ({
        x: Math.round(roomW - margin - b.w - i * sX),
        y: Math.round(roomH - margin - b.h - i * sY),
      }));
    }
    case 'grid': {
      const cols = Math.ceil(Math.sqrt(n));
      const cellW = (roomW - margin * 2) / cols;
      const cellH = (roomH - margin * 2) / Math.ceil(n / cols);
      return boxes.map((b, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return {
          x: Math.round(margin + col * cellW + (cellW - b.w) / 2),
          y: Math.round(margin + row * cellH + (cellH - b.h) / 2),
        };
      });
    }
    case 'circle': {
      const cx = roomW / 2;
      const cy = roomH / 2;
      const maxDim = Math.max(...boxes.map((b) => Math.max(b.w, b.h)));
      const radius = Math.min(roomW, roomH) / 2 - margin - maxDim / 2;
      return boxes.map((b, i) => {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        return {
          x: Math.round(cx + radius * Math.cos(angle) - b.w / 2),
          y: Math.round(cy + radius * Math.sin(angle) - b.h / 2),
        };
      });
    }
  }
}
