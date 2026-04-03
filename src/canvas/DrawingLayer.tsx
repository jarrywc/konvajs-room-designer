import { useState, useRef, useCallback, useEffect } from 'react';
import { Group, Rect, Ellipse, Line, Circle } from 'react-konva';
import type Konva from 'konva';
import { useCanvasStore } from '../store/canvas-store';
import type { RoomElementType } from '../types/room';
import type { TableShape } from '../types/table';
import { computeFreeformSeats } from '../worker/geometry/freeform-seats';
import { SEAT_RADIUS } from '../utils/constants';
import { useSettingsStore } from '../store/settings-store';

/** Data emitted when a figure drawing is completed */
export interface DrawnFigure {
  elementType: RoomElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  points?: number[];
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  cornerRadius?: number;
  config?: Record<string, unknown>;
}

/** Data emitted when a table drawing is completed */
export interface DrawnTable {
  tableShape: TableShape;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DrawingHandlers {
  handleMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => boolean;
  handleMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  handleMouseUp: () => void;
  handleDblClick: () => void;
}

interface DrawingLayerProps {
  onComplete: (figure: DrawnFigure) => void;
  onTableComplete?: (table: DrawnTable) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  /** Parent writes handlers here so it can forward mouse events */
  drawingRef: React.MutableRefObject<DrawingHandlers | null>;
}

type TableDrawTool = 'draw_round_table' | 'draw_rect_table' | 'draw_oval_table';

const TABLE_TOOL_SHAPE_MAP: Record<TableDrawTool, TableShape> = {
  draw_round_table: 'round',
  draw_rect_table: 'rectangle',
  draw_oval_table: 'oval',
};

function isTableDrawTool(tool: string): tool is TableDrawTool {
  return tool in TABLE_TOOL_SHAPE_MAP;
}

type DrawState =
  | null
  | { tool: 'rect' | 'ellipse'; startX: number; startY: number; curX: number; curY: number }
  | { tool: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { tool: 'polygon'; points: number[]; curX: number; curY: number }
  | { tool: 'freehand'; points: number[] }
  | { tool: TableDrawTool; startX: number; startY: number; curX: number; curY: number };

export function DrawingLayer({ onComplete, onTableComplete, stageRef, drawingRef }: DrawingLayerProps) {
  const activeTool = useCanvasStore((s) => s.activeTool);
  const strokeColor = useCanvasStore((s) => s.drawStrokeColor);
  const fillColor = useCanvasStore((s) => s.drawFillColor);
  const strokeWidth = useCanvasStore((s) => s.drawStrokeWidth);
  const cornerRadius = useCanvasStore((s) => s.drawCornerRadius);
  const scale = useCanvasStore((s) => s.scale);
  const position = useCanvasStore((s) => s.position);

  const [draw, setDraw] = useState<DrawState>(null);
  const drawRef = useRef<DrawState>(null);
  drawRef.current = draw;

  // Keep latest callbacks in refs to avoid stale closures
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onTableCompleteRef = useRef(onTableComplete);
  onTableCompleteRef.current = onTableComplete;
  const colorsRef = useRef({ strokeColor, fillColor, strokeWidth, cornerRadius });
  colorsRef.current = { strokeColor, fillColor, strokeWidth, cornerRadius };

  const getCanvasPos = useCallback((): { x: number; y: number } | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    return {
      x: (pointer.x - position.x) / scale,
      y: (pointer.y - position.y) / scale,
    };
  }, [stageRef, position, scale]);

  const emitFigure = useCallback((figure: DrawnFigure) => {
    onCompleteRef.current(figure);
  }, []);

  const finishPolygon = useCallback(
    (pts: number[]) => {
      const xs = pts.filter((_, i) => i % 2 === 0);
      const ys = pts.filter((_, i) => i % 2 === 1);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      const relPoints = pts.map((v, i) => Math.round(i % 2 === 0 ? v - minX : v - minY));
      const c = colorsRef.current;
      emitFigure({
        elementType: 'figure_polygon',
        x: Math.round(minX), y: Math.round(minY),
        width: Math.round(maxX - minX), height: Math.round(maxY - minY),
        points: relPoints,
        fillColor: c.fillColor, strokeColor: c.strokeColor, strokeWidth: c.strokeWidth,
      });
      setDraw(null);
    },
    [emitFigure]
  );

  const finishFreehand = useCallback(
    (pts: number[]) => {
      const xs = pts.filter((_, i) => i % 2 === 0);
      const ys = pts.filter((_, i) => i % 2 === 1);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs);
      const maxY = Math.max(...ys);
      const relPoints = pts.map((v, i) => Math.round(i % 2 === 0 ? v - minX : v - minY));
      const c = colorsRef.current;
      emitFigure({
        elementType: 'figure_freehand',
        x: Math.round(minX), y: Math.round(minY),
        width: Math.round(maxX - minX) || 1, height: Math.round(maxY - minY) || 1,
        points: relPoints,
        fillColor: 'transparent', strokeColor: c.strokeColor, strokeWidth: c.strokeWidth,
      });
    },
    [emitFigure]
  );

  // ── Event handlers ──────────────────────────────────────────────

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>): boolean => {
      if (activeTool === 'select') return false;
      if (e.evt.button !== 0) return false;

      const pos = getCanvasPos();
      if (!pos) return false;

      if (activeTool === 'text') {
        const c = colorsRef.current;
        emitFigure({
          elementType: 'text',
          x: Math.round(pos.x - 75), y: Math.round(pos.y - 15),
          width: 150, height: 30,
          fillColor: 'transparent', strokeColor: 'transparent', strokeWidth: 0,
          config: {
            text: 'Text',
            fontSize: 16,
            fontFamily: 'sans-serif',
            fontWeight: 'normal',
            textColor: c.strokeColor,
            align: 'center',
          },
        });
        useCanvasStore.getState().setActiveTool('select');
        return true;
      }
      if (activeTool === 'rect' || activeTool === 'ellipse') {
        setDraw({ tool: activeTool, startX: pos.x, startY: pos.y, curX: pos.x, curY: pos.y });
        return true;
      }
      if (isTableDrawTool(activeTool)) {
        setDraw({ tool: activeTool, startX: pos.x, startY: pos.y, curX: pos.x, curY: pos.y });
        return true;
      }
      if (activeTool === 'line') {
        setDraw({ tool: 'line', x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
        return true;
      }
      if (activeTool === 'polygon') {
        const cur = drawRef.current;
        if (cur && cur.tool === 'polygon') {
          const pts = cur.points;
          if (pts.length >= 6) {
            const dx = pos.x - pts[0]!;
            const dy = pos.y - pts[1]!;
            if (Math.sqrt(dx * dx + dy * dy) < 15) {
              finishPolygon(cur.points);
              return true;
            }
          }
          setDraw({ ...cur, points: [...cur.points, pos.x, pos.y], curX: pos.x, curY: pos.y });
        } else {
          setDraw({ tool: 'polygon', points: [pos.x, pos.y], curX: pos.x, curY: pos.y });
        }
        return true;
      }
      if (activeTool === 'freehand') {
        setDraw({ tool: 'freehand', points: [pos.x, pos.y] });
        return true;
      }
      return false;
    },
    [activeTool, getCanvasPos, finishPolygon]
  );

  const handleMouseMove = useCallback(
    (_e: Konva.KonvaEventObject<MouseEvent>) => {
      const cur = drawRef.current;
      if (!cur) return;
      const pos = getCanvasPos();
      if (!pos) return;

      if (cur.tool === 'rect' || cur.tool === 'ellipse') {
        setDraw({ ...cur, curX: pos.x, curY: pos.y });
      } else if (cur.tool === 'draw_round_table' || cur.tool === 'draw_rect_table' || cur.tool === 'draw_oval_table') {
        setDraw({ ...cur, curX: pos.x, curY: pos.y });
      } else if (cur.tool === 'line') {
        setDraw({ ...cur, x2: pos.x, y2: pos.y });
      } else if (cur.tool === 'polygon') {
        setDraw({ ...cur, curX: pos.x, curY: pos.y });
      } else if (cur.tool === 'freehand') {
        setDraw({ ...cur, points: [...cur.points, pos.x, pos.y] });
      }
    },
    [getCanvasPos]
  );

  const handleMouseUp = useCallback(() => {
    const cur = drawRef.current;
    if (!cur) return;
    const c = colorsRef.current;

    if (cur.tool === 'draw_round_table' || cur.tool === 'draw_rect_table' || cur.tool === 'draw_oval_table') {
      const x = Math.min(cur.startX, cur.curX);
      const y = Math.min(cur.startY, cur.curY);
      let w = Math.abs(cur.curX - cur.startX);
      let h = Math.abs(cur.curY - cur.startY);
      // Round tables are constrained to circles
      if (cur.tool === 'draw_round_table') {
        const size = Math.min(w, h);
        w = size;
        h = size;
      }
      if (w > 20 && h > 20) {
        onTableCompleteRef.current?.({
          tableShape: TABLE_TOOL_SHAPE_MAP[cur.tool],
          x: Math.round(x), y: Math.round(y),
          width: Math.round(w), height: Math.round(h),
        });
      }
      setDraw(null);
      return;
    }

    if (cur.tool === 'rect' || cur.tool === 'ellipse') {
      const x = Math.min(cur.startX, cur.curX);
      const y = Math.min(cur.startY, cur.curY);
      const w = Math.abs(cur.curX - cur.startX);
      const h = Math.abs(cur.curY - cur.startY);
      if (w > 3 && h > 3) {
        emitFigure({
          elementType: cur.tool === 'rect' ? 'figure_rect' : 'figure_ellipse',
          x: Math.round(x), y: Math.round(y),
          width: Math.round(w), height: Math.round(h),
          fillColor: c.fillColor, strokeColor: c.strokeColor, strokeWidth: c.strokeWidth,
          cornerRadius: cur.tool === 'rect' ? c.cornerRadius : undefined,
        });
      }
      setDraw(null);
    } else if (cur.tool === 'line') {
      const dx = cur.x2 - cur.x1;
      const dy = cur.y2 - cur.y1;
      if (Math.sqrt(dx * dx + dy * dy) > 3) {
        const minX = Math.min(cur.x1, cur.x2);
        const minY = Math.min(cur.y1, cur.y2);
        emitFigure({
          elementType: 'figure_line',
          x: Math.round(minX), y: Math.round(minY),
          width: Math.round(Math.abs(dx)) || 1, height: Math.round(Math.abs(dy)) || 1,
          points: [
            Math.round(cur.x1 - minX), Math.round(cur.y1 - minY),
            Math.round(cur.x2 - minX), Math.round(cur.y2 - minY),
          ],
          fillColor: 'transparent', strokeColor: c.strokeColor, strokeWidth: c.strokeWidth,
        });
      }
      setDraw(null);
    } else if (cur.tool === 'freehand') {
      if (cur.points.length >= 4) finishFreehand(cur.points);
      setDraw(null);
    }
    // polygon stays open — finished by click-near-start or double-click
  }, [emitFigure, finishFreehand]);

  const handleDblClick = useCallback(() => {
    const cur = drawRef.current;
    if (cur && cur.tool === 'polygon' && cur.points.length >= 6) {
      finishPolygon(cur.points);
    }
  }, [finishPolygon]);

  // Register handlers with parent
  useEffect(() => {
    drawingRef.current = { handleMouseDown, handleMouseMove, handleMouseUp, handleDblClick };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleDblClick, drawingRef]);

  // Reset draw state when tool changes
  useEffect(() => {
    setDraw(null);
  }, [activeTool]);

  // ── Preview rendering ───────────────────────────────────────────
  if (!draw) return null;

  if (draw.tool === 'rect') {
    const x = Math.min(draw.startX, draw.curX);
    const y = Math.min(draw.startY, draw.curY);
    const w = Math.abs(draw.curX - draw.startX);
    const h = Math.abs(draw.curY - draw.startY);
    return (
      <Rect
        x={x} y={y} width={w} height={h}
        fill={fillColor === 'transparent' ? undefined : fillColor}
        stroke={strokeColor} strokeWidth={strokeWidth}
        cornerRadius={cornerRadius}
        dash={[6, 3]} listening={false}
      />
    );
  }

  if (draw.tool === 'ellipse') {
    const x = Math.min(draw.startX, draw.curX);
    const y = Math.min(draw.startY, draw.curY);
    const w = Math.abs(draw.curX - draw.startX);
    const h = Math.abs(draw.curY - draw.startY);
    return (
      <Ellipse
        x={x + w / 2} y={y + h / 2} radiusX={w / 2} radiusY={h / 2}
        fill={fillColor === 'transparent' ? undefined : fillColor}
        stroke={strokeColor} strokeWidth={strokeWidth}
        dash={[6, 3]} listening={false}
      />
    );
  }

  if (draw.tool === 'line') {
    return (
      <Line
        points={[draw.x1, draw.y1, draw.x2, draw.y2]}
        stroke={strokeColor} strokeWidth={strokeWidth}
        dash={[6, 3]} listening={false}
      />
    );
  }

  if (draw.tool === 'polygon') {
    const previewPts = [...draw.points, draw.curX, draw.curY];
    return (
      <>
        <Line
          points={previewPts}
          stroke={strokeColor} strokeWidth={strokeWidth}
          fill={fillColor === 'transparent' ? undefined : fillColor}
          closed={false} dash={[6, 3]} listening={false}
        />
        {draw.points.length >= 2 && (
          <Circle
            x={draw.points[0]!} y={draw.points[1]!}
            radius={6}
            fill="rgba(66, 153, 225, 0.4)"
            stroke="#4299E1" strokeWidth={1}
            listening={false}
          />
        )}
      </>
    );
  }

  if (draw.tool === 'freehand') {
    return (
      <Line
        points={draw.points}
        stroke={strokeColor} strokeWidth={strokeWidth}
        lineCap="round" lineJoin="round" tension={0.3}
        listening={false}
      />
    );
  }

  if (isTableDrawTool(draw.tool)) {
    const x = Math.min(draw.startX, draw.curX);
    const y = Math.min(draw.startY, draw.curY);
    let w = Math.abs(draw.curX - draw.startX);
    let h = Math.abs(draw.curY - draw.startY);
    if (draw.tool === 'draw_round_table') {
      const size = Math.min(w, h);
      w = size;
      h = size;
    }
    const tableShape = TABLE_TOOL_SHAPE_MAP[draw.tool];
    const seatGaps = useSettingsStore.getState().seatGaps;
    const previewSeats = w > 20 && h > 20 ? computeFreeformSeats(tableShape, w, h, seatGaps) : [];
    const cx = x + w / 2;
    const cy = y + h / 2;

    return (
      <Group listening={false}>
        {tableShape === 'round' ? (
          <Circle
            x={cx} y={cy} radius={w / 2}
            stroke="#4299E1" strokeWidth={2}
            fill="rgba(66, 153, 225, 0.1)"
            dash={[6, 3]}
          />
        ) : tableShape === 'oval' ? (
          <Ellipse
            x={cx} y={cy} radiusX={w / 2} radiusY={h / 2}
            stroke="#4299E1" strokeWidth={2}
            fill="rgba(66, 153, 225, 0.1)"
            dash={[6, 3]}
          />
        ) : (
          <Rect
            x={x} y={y} width={w} height={h}
            stroke="#4299E1" strokeWidth={2}
            fill="rgba(66, 153, 225, 0.1)"
            dash={[6, 3]}
          />
        )}
        {previewSeats.map((seat, i) => (
          <Circle
            key={i}
            x={cx + seat.x} y={cy + seat.y}
            radius={SEAT_RADIUS}
            fill="rgba(66, 153, 225, 0.3)"
            stroke="#4299E1" strokeWidth={1}
          />
        ))}
      </Group>
    );
  }

  return null;
}
