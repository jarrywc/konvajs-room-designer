import { useRef, useCallback, useState } from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import type Konva from 'konva';
import { useCanvasStore } from '../store/canvas-store';
import { useSelectionStore } from '../store/selection-store';
import { useRenderStore } from '../store/render-store';
import { GridLayer } from './GridLayer';
import { SelectionRect } from './SelectionRect';
import { MIN_SCALE, MAX_SCALE, ZOOM_STEP } from '../utils/constants';
import { clamp } from '../utils/math';

interface DesignerStageProps {
  width: number;
  height: number;
  children?: React.ReactNode;
  stageRef?: React.RefObject<Konva.Stage | null>;
  transformerRef?: React.RefObject<Konva.Transformer | null>;
}

export function DesignerStage({ width, height, children, stageRef: externalStageRef, transformerRef: externalTrRef }: DesignerStageProps) {
  const scale = useCanvasStore((s) => s.scale);
  const position = useCanvasStore((s) => s.position);
  const setScale = useCanvasStore((s) => s.setScale);
  const setPosition = useCanvasStore((s) => s.setPosition);
  const clearSelection = useSelectionStore((s) => s.clearSelection);
  const selectMultiple = useSelectionStore((s) => s.selectMultiple);
  const roomWidthPx = useRenderStore((s) => s.room.widthPx);
  const roomHeightPx = useRenderStore((s) => s.room.heightPx);
  const bgColor = useRenderStore((s) => s.room.backgroundColor);
  const tables = useRenderStore((s) => s.tables);
  const elements = useRenderStore((s) => s.room.elements);

  const internalStageRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef ?? internalStageRef;
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; stageX: number; stageY: number } | null>(null);

  // Marquee state
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);

  // ── Zoom via wheel ──────────────────────────────────────────────
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

  // ── Pan via middle-mouse or space+drag ──────────────────────────
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.evt.button === 1 || e.evt.getModifierState?.('Space')) {
        setIsPanning(true);
        panStartRef.current = {
          x: e.evt.clientX,
          y: e.evt.clientY,
          stageX: position.x,
          stageY: position.y,
        };
        e.evt.preventDefault();
        return;
      }

      const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'room-bg';
      if (clickedOnEmpty && e.evt.button === 0) {
        if (!e.evt.shiftKey && !e.evt.metaKey) {
          clearSelection();
        }
        const stage = stageRef.current;
        if (stage) {
          const pointer = stage.getPointerPosition();
          if (pointer) {
            const x = (pointer.x - position.x) / scale;
            const y = (pointer.y - position.y) / scale;
            marqueeStartRef.current = { x, y };
          }
        }
      }
    },
    [position, scale, clearSelection, stageRef]
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (isPanning && panStartRef.current) {
        const dx = e.evt.clientX - panStartRef.current.x;
        const dy = e.evt.clientY - panStartRef.current.y;
        setPosition(panStartRef.current.stageX + dx, panStartRef.current.stageY + dy);
        return;
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
          x: Math.min(start.x, x),
          y: Math.min(start.y, y),
          w: Math.abs(x - start.x),
          h: Math.abs(y - start.y),
        });
      }
    },
    [isPanning, position, scale, setPosition, stageRef]
  );

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }
    if (marqueeStartRef.current && marquee) {
      // Select items within marquee
      const ids: string[] = [];
      for (const t of tables) {
        const cx = t.x + t.width / 2;
        const cy = t.y + t.height / 2;
        if (cx >= marquee.x && cx <= marquee.x + marquee.w && cy >= marquee.y && cy <= marquee.y + marquee.h) {
          ids.push(t.id);
        }
      }
      for (const el of elements) {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        if (cx >= marquee.x && cx <= marquee.x + marquee.w && cy >= marquee.y && cy <= marquee.y + marquee.h) {
          ids.push(el.id);
        }
      }
      if (ids.length > 0) selectMultiple(ids);
      marqueeStartRef.current = null;
      setMarquee(null);
    } else if (marqueeStartRef.current) {
      marqueeStartRef.current = null;
      setMarquee(null);
    }
  }, [isPanning, marquee, tables, elements, selectMultiple]);

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      scaleX={scale}
      scaleY={scale}
      x={position.x}
      y={position.y}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isPanning ? 'grabbing' : 'default' }}
    >
      {/* Grid layer (non-interactive) */}
      <Layer listening={false}>
        <GridLayer viewWidth={width} viewHeight={height} />
      </Layer>

      {/* Room background layer */}
      <Layer listening={false}>
        <Rect
          x={0}
          y={0}
          width={roomWidthPx}
          height={roomHeightPx}
          fill={bgColor}
          stroke="#CBD5E0"
          strokeWidth={1}
          name="room-bg"
          listening={false}
        />
      </Layer>

      {/* Interactive content layer */}
      <Layer>
        {children}
        <SelectionRect rect={marquee} />
        {/* Transformer is placed via external ref */}
        {externalTrRef && (
          <Transformer
            ref={externalTrRef}
            rotateEnabled
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            boundBoxFunc={(oldBox, newBox) => {
              if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) return oldBox;
              return newBox;
            }}
          />
        )}
      </Layer>
    </Stage>
  );
}
