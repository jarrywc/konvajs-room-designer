import { useState, useRef, useEffect, useCallback } from 'react';
import type { RoomElement } from '../../types/room';
import { useCanvasStore } from '../../store/canvas-store';

interface TextEditOverlayProps {
  element: RoomElement;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
  onCommit: (id: string, text: string) => void;
  onCancel: () => void;
}

export function TextEditOverlay({ element, canvasContainerRef, onCommit, onCancel }: TextEditOverlayProps) {
  const cfg = element.config ?? {};
  const [text, setText] = useState((cfg.text as string) ?? 'Text');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scale = useCanvasStore((s) => s.scale);
  const position = useCanvasStore((s) => s.position);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  const handleBlur = useCallback(() => {
    onCommit(element.id, text);
  }, [element.id, text, onCommit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onCommit(element.id, text);
      }
    },
    [element.id, text, onCommit, onCancel]
  );

  // Position the textarea over the canvas element
  const rect = canvasContainerRef.current?.getBoundingClientRect();
  if (!rect) return null;

  const x = rect.left + element.x * scale + position.x;
  const y = rect.top + element.y * scale + position.y;
  const w = element.width * scale;
  const h = Math.max(element.height * scale, 30);
  const fontSize = ((cfg.fontSize as number) ?? 16) * scale;

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        width: w,
        minHeight: h,
        fontSize,
        fontFamily: (cfg.fontFamily as string) ?? 'sans-serif',
        fontWeight: (cfg.fontWeight as string) ?? 'normal',
        textAlign: (cfg.align as React.CSSProperties['textAlign']) ?? 'center',
        color: (cfg.textColor as string) ?? '#2D3748',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '2px solid #4299E1',
        borderRadius: 3,
        padding: '2px 4px',
        outline: 'none',
        resize: 'none',
        zIndex: 9999,
        lineHeight: 1.4,
        boxSizing: 'border-box',
      }}
    />
  );
}
