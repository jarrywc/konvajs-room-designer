import { snapTo } from '../../utils/math';

export function snapPosition(
  x: number,
  y: number,
  gridSize: number
): { x: number; y: number } {
  return {
    x: snapTo(x, gridSize),
    y: snapTo(y, gridSize),
  };
}
