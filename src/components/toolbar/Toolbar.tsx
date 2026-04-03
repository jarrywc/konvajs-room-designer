import { useCanvasStore } from '../../store/canvas-store';
import { useRenderStore } from '../../store/render-store';
import { useSelectionStore } from '../../store/selection-store';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onSave?: () => void;
  onDiscard?: () => void;
  children?: React.ReactNode;
}

export function Toolbar({ onUndo, onRedo, onDelete, onDuplicate, onSave, onDiscard, children }: ToolbarProps) {
  const canUndo = useRenderStore((s) => s.canUndo);
  const canRedo = useRenderStore((s) => s.canRedo);
  const dirty = useRenderStore((s) => s.dirty);
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const showGrid = useCanvasStore((s) => s.showGrid);
  const snapToGrid = useCanvasStore((s) => s.snapToGrid);
  const toggleGrid = useCanvasStore((s) => s.toggleGrid);
  const toggleSnap = useCanvasStore((s) => s.toggleSnap);
  const zoomIn = useCanvasStore((s) => s.zoomIn);
  const zoomOut = useCanvasStore((s) => s.zoomOut);
  const scale = useCanvasStore((s) => s.scale);

  const hasSelection = selectedIds.size > 0;

  return (
    <div style={container}>
      <div style={group}>
        <button onClick={onUndo} disabled={!canUndo} style={btn} title="Undo (Ctrl+Z)">
          Undo
        </button>
        <button onClick={onRedo} disabled={!canRedo} style={btn} title="Redo (Ctrl+Shift+Z)">
          Redo
        </button>
      </div>

      <div style={separator} />

      <div style={group}>
        <button onClick={zoomOut} style={btn} title="Zoom out">-</button>
        <span style={{ fontSize: 11, minWidth: 40, textAlign: 'center' }}>
          {Math.round(scale * 100)}%
        </span>
        <button onClick={zoomIn} style={btn} title="Zoom in">+</button>
      </div>

      <div style={separator} />

      <div style={group}>
        <button onClick={toggleGrid} style={toggleBtn(showGrid)} title="Toggle grid">
          Grid
        </button>
        <button onClick={toggleSnap} style={toggleBtn(snapToGrid)} title="Toggle snap">
          Snap
        </button>
      </div>

      <div style={separator} />

      <div style={group}>
        <button onClick={onDelete} disabled={!hasSelection} style={btn} title="Delete selected">
          Delete
        </button>
        <button onClick={onDuplicate} disabled={!hasSelection} style={btn} title="Duplicate selected">
          Duplicate
        </button>
      </div>

      {children && (
        <>
          <div style={separator} />
          {children}
        </>
      )}

      <div style={{ flex: 1 }} />

      {dirty && onDiscard && (
        <button onClick={onDiscard} style={{ ...btn, color: '#E53E3E' }}>
          Discard
        </button>
      )}
      {onSave && (
        <button onClick={onSave} disabled={!dirty} style={{ ...btn, background: '#4299E1', color: '#fff' }}>
          Save
        </button>
      )}
    </div>
  );
}

const container: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '6px 12px',
  borderBottom: '1px solid #E2E8F0',
  background: '#FFFFFF',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const group: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
};

const separator: React.CSSProperties = {
  width: 1,
  height: 20,
  background: '#E2E8F0',
  margin: '0 4px',
};

const btn: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: 11,
  border: '1px solid #E2E8F0',
  borderRadius: 4,
  background: '#F7FAFC',
  cursor: 'pointer',
};

const toggleBtn = (active: boolean): React.CSSProperties => ({
  ...btn,
  background: active ? '#EBF8FF' : '#F7FAFC',
  borderColor: active ? '#4299E1' : '#E2E8F0',
  color: active ? '#2B6CB0' : '#4A5568',
});
