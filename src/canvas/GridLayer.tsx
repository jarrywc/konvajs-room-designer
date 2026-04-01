import { useMemo } from 'react';
import { Line } from 'react-konva';
import { useCanvasStore } from '../store/canvas-store';
import { useRenderStore } from '../store/render-store';
import { useSettingsStore } from '../store/settings-store';

interface GridLayerProps {
  viewWidth: number;
  viewHeight: number;
}

export function GridLayer({ viewWidth, viewHeight }: GridLayerProps) {
  const scale = useCanvasStore((s) => s.scale);
  const position = useCanvasStore((s) => s.position);
  const showGrid = useCanvasStore((s) => s.showGrid);
  const gridSize = useRenderStore((s) => s.room.gridSize);
  const gridColor = useSettingsStore((s) => s.gridColor);

  const lines = useMemo(() => {
    if (!showGrid || gridSize <= 0) return [];

    const result: JSX.Element[] = [];
    const minX = -position.x / scale;
    const minY = -position.y / scale;
    const maxX = (viewWidth - position.x) / scale;
    const maxY = (viewHeight - position.y) / scale;
    const strokeWidth = 1 / scale;

    for (let x = Math.floor(minX / gridSize) * gridSize; x <= maxX; x += gridSize) {
      result.push(
        <Line
          key={`v-${x}`}
          points={[x, minY, x, maxY]}
          stroke={gridColor}
          strokeWidth={strokeWidth}
          opacity={0.5}
          listening={false}
          perfectDrawEnabled={false}
        />
      );
    }
    for (let y = Math.floor(minY / gridSize) * gridSize; y <= maxY; y += gridSize) {
      result.push(
        <Line
          key={`h-${y}`}
          points={[minX, y, maxX, y]}
          stroke={gridColor}
          strokeWidth={strokeWidth}
          opacity={0.5}
          listening={false}
          perfectDrawEnabled={false}
        />
      );
    }
    return result;
  }, [showGrid, gridSize, scale, position.x, position.y, viewWidth, viewHeight, gridColor]);

  return <>{lines}</>;
}
