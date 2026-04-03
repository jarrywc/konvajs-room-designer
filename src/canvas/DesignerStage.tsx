import { useRef, useCallback, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import type Konva from 'konva';
import { useCanvasStore } from '../store/canvas-store';
import { useSelectionStore } from '../store/selection-store';
import { useRenderStore } from '../store/render-store';
import { GridLayer } from './GridLayer';
import { SelectionRect } from './SelectionRect';
import { DrawingLayer, type DrawnFigure, type DrawnTable, type DrawingHandlers } from './DrawingLayer';
import { MIN_SCALE, MAX_SCALE, ZOOM_STEP } from '../utils/constants';
import { clamp } from '../utils/math';

interface DesignerStageProps {
  width: number;
  height: number;
  children?: React.ReactNode;
  stageRef?: React.RefObject<Konva.Stage | null>;
  transformerRef?: React.RefObject<Konva.Transformer | null>;
  onFigureComplete?: (figure: DrawnFigure) => void;
  onTableComplete?: (table: DrawnTable) => void;
  onTransformEnd?: (e: Konva.KonvaEventObject<Event>) => void;
}

export function DesignerStage({ width, height, children, stageRef: externalStageRef, transformerRef: externalTrRef, onFigureComplete, onTableComplete, onTransformEnd }: DesignerStageProps) {
  const scale = useCanvasStore((s) => s.scale);
  const position = useCanvasStore((s) => s.position);
  const setScale = useCanvasStore((s) => s.setScale);
  const setPosition = useCanvasStore((s) => s.setPosition);
  const clearSelection = useSelectionStore((s) => s.clearSelection);
  const selectMultiple = useSelectionStore((s) => s.selectMultiple);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const roomWidthPx = useRenderStore((s) => s.room.widthPx);
  const roomHeightPx = useRenderStore((s) => s.room.heightPx);
  const bgColor = useRenderStore((s) => s.room.backgroundColor);
  const tables = useRenderStore((s) => s.tables);
  const elements = useRenderStore((s) => s.room.elements);

  const internalStageRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef ?? internalStageRef;
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; stageX: number; stageY: number } | null>(null);

  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);

  // Drawing handlers ref — populated by DrawingLayer
  const drawingRef = useRef<DrawingHandlers | null>(null);
  const isDrawingTool = activeTool !== 'select';

  // Shift-to-constrain proportional resize
  useEffect(() => {
    const tr = externalTrRef?.current;
    if (!tr) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Shift') tr.keepRatio(e.type === 'keydown');
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, [externalTrRef]);

  // ── Zoom ────────────────────────────────────────────────────────
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = clamp(scale * (1 + direction * ZOOM_STEP), MIN_SCALE, MAX_SCALE);
      const mousePointTo = {
        x: (pointer.x - position.x) / scale,
        y: (pointer.y - position.y) / scale,
      };
      setScale(newScale);
      setPosition(pointer.x - mousePointTo.x * newScale, pointer.y - mousePointTo.y * newScale);
    },
    [scale, position, setScale, setPosition, stageRef]
  );

  // ── Mouse handlers ──────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Pan (middle mouse / space)
      if (e.evt.button === 1 || e.evt.getModifierState?.('Space')) {
        setIsPanning(true);
        panStartRef.current = { x: e.evt.clientX, y: e.evt.clientY, stageX: position.x, stageY: position.y };
        e.evt.preventDefault();
        return;
      }

      // Drawing tool
      if (isDrawingTool && drawingRef.current) {
        const handled = drawingRef.current.handleMouseDown(e);
        if (handled) return;
      }

      // Select mode
      const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'room-bg';
      if (clickedOnEmpty && e.evt.button === 0) {
        if (!e.evt.shiftKey && !e.evt.metaKey) clearSelection();
        const stage = stageRef.current;
        if (stage) {
          const pointer = stage.getPointerPosition();
          if (pointer) {
            marqueeStartRef.current = {
              x: (pointer.x - position.x) / scale,
              y: (pointer.y - position.y) / scale,
            };
          }
        }
      }
    },
    [position, scale, clearSelection, stageRef, isDrawingTool]
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (isPanning && panStartRef.current) {
        const dx = e.evt.clientX - panStartRef.current.x;
        const dy = e.evt.clientY - panStartRef.current.y;
        setPosition(panStartRef.current.stageX + dx, panStartRef.current.stageY + dy);
        return;
      }

      if (isDrawingTool && drawingRef.current) {
        drawingRef.current.handleMouseMove(e);
      }

      if (marqueeStartRef.current) {
        const stage = stageRef.current;
        if (!stage) return;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;
        const x = (pointer.x - position.x) / scale;
        const y = (pointer.y - position.y) / scale;
        const start = marqueeStartRef.current;
        setMarquee({
          x: Math.min(start.x, x), y: Math.min(start.y, y),
          w: Math.abs(x - start.x), h: Math.abs(y - start.y),
        });
      }
    },
    [isPanning, position, scale, setPosition, stageRef, isDrawingTool]
  );

  const handleMouseUp = useCallback(() => {
    if (isPanning) { setIsPanning(false); panStartRef.current = null; }

    if (isDrawingTool && drawingRef.current) {
      drawingRef.current.handleMouseUp();
    }

    if (marqueeStartRef.current && marquee) {
      const ids: string[] = [];
      for (const t of tables) {
        const cx = t.x + t.width / 2, cy = t.y + t.height / 2;
        if (cx >= marquee.x && cx <= marquee.x + marquee.w && cy >= marquee.y && cy <= marquee.y + marquee.h) ids.push(t.id);
      }
      for (const el of elements) {
        const cx = el.x + el.width / 2, cy = el.y + el.height / 2;
        if (cx >= marquee.x && cx <= marquee.x + marquee.w && cy >= marquee.y && cy <= marquee.y + marquee.h) ids.push(el.id);
      }
      if (ids.length > 0) selectMultiple(ids);
      marqueeStartRef.current = null;
      setMarquee(null);
    } else if (marqueeStartRef.current) {
      marqueeStartRef.current = null;
      setMarquee(null);
    }
  }, [isPanning, marquee, tables, elements, selectMultiple, isDrawingTool]);

  const handleDblClick = useCallback(() => {
    if (isDrawingTool && drawingRef.current) drawingRef.current.handleDblClick();
  }, [isDrawingTool]);

  const getCursor = () => {
    if (isPanning) return 'grabbing';
    if (isDrawingTool) return 'crosshair';
    return 'default';
  };

  return (
    <Stage
      ref={stageRef as React.LegacyRef<Konva.Stage>}
      width={width} height={height}
      scaleX={scale} scaleY={scale}
      x={position.x} y={position.y}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDblClick={handleDblClick}
      style={{ cursor: getCursor() }}
    >
      <Layer listening={false}>
        <GridLayer viewWidth={width} viewHeight={height} />
      </Layer>

      <Layer listening={false}>
        <Rect
          x={0} y={0} width={roomWidthPx} height={roomHeightPx}
          fill={bgColor} stroke="#CBD5E0" strokeWidth={1}
          name="room-bg" listening={false}
        />
      </Layer>

      <Layer>
        {children}
        <SelectionRect rect={marquee} />
        {onFigureComplete && (
          <DrawingLayer
            onComplete={onFigureComplete}
            onTableComplete={onTableComplete}
            stageRef={stageRef}
            drawingRef={drawingRef}
          />
        )}
        {externalTrRef && (
          <Transformer
            ref={externalTrRef as React.LegacyRef<Konva.Transformer>}
            rotateEnabled
            enabledAnchors={[
              'top-left', 'top-center', 'top-right',
              'middle-left', 'middle-right',
              'bottom-left', 'bottom-center', 'bottom-right',
            ]}
            keepRatio={false}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) return oldBox;
              return newBox;
            }}
            onTransformEnd={onTransformEnd}
          />
        )}
      </Layer>
    </Stage>
  );
}
