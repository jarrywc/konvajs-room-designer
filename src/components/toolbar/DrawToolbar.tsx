import { useCanvasStore, type DrawingTool } from '../../store/canvas-store';

const SHAPE_TOOLS: { id: DrawingTool; label: string; title: string }[] = [
  { id: 'select', label: 'V', title: 'Select (V)' },
  { id: 'rect', label: '[]', title: 'Rectangle (R)' },
  { id: 'ellipse', label: 'O', title: 'Ellipse (E)' },
  { id: 'line', label: '/', title: 'Line (L)' },
  { id: 'polygon', label: 'P', title: 'Polygon (P) — click to add points, double-click to close' },
  { id: 'freehand', label: '~', title: 'Freehand (F) — draw with mouse' },
  { id: 'text', label: 'T', title: 'Text (T)' },
];

const TABLE_TOOLS: { id: DrawingTool; label: string; title: string }[] = [
  { id: 'draw_round_table', label: '(O)', title: 'Draw Round Table (1)' },
  { id: 'draw_rect_table', label: '[T]', title: 'Draw Rectangle Table (2)' },
  { id: 'draw_oval_table', label: '(T)', title: 'Draw Oval Table (3)' },
];

function isTableTool(tool: DrawingTool): boolean {
  return tool.startsWith('draw_');
}

export function DrawToolbar() {
  const activeTool = useCanvasStore((s) => s.activeTool);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);
  const strokeColor = useCanvasStore((s) => s.drawStrokeColor);
  const fillColor = useCanvasStore((s) => s.drawFillColor);
  const strokeWidth = useCanvasStore((s) => s.drawStrokeWidth);
  const setStrokeColor = useCanvasStore((s) => s.setDrawStrokeColor);
  const setFillColor = useCanvasStore((s) => s.setDrawFillColor);
  const setStrokeWidth = useCanvasStore((s) => s.setDrawStrokeWidth);
  const drawCornerRadius = useCanvasStore((s) => s.drawCornerRadius);
  const setDrawCornerRadius = useCanvasStore((s) => s.setDrawCornerRadius);

  const isDrawing = activeTool !== 'select';
  const isTableDrawing = isTableTool(activeTool);
  const isTextTool = activeTool === 'text';
  const showDrawOptions = isDrawing && !isTableDrawing && !isTextTool;

  return (
    <div style={container}>
      <div style={toolGroup}>
        {SHAPE_TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            style={toolBtn(activeTool === t.id)}
            title={t.title}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={separator} />

      <div style={toolGroup}>
        {TABLE_TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            style={toolBtn(activeTool === t.id)}
            title={t.title}
          >
            {t.label}
          </button>
        ))}
      </div>

      {showDrawOptions && (
        <>
          <div style={separator} />
          <div style={optionGroup}>
            <label style={optLabel} title="Stroke color">
              <span style={optIcon}>S</span>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                style={colorInput}
              />
            </label>
            <label style={optLabel} title="Fill color">
              <span style={optIcon}>F</span>
              <input
                type="color"
                value={fillColor === 'transparent' ? '#ffffff' : fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                style={colorInput}
              />
              <button
                onClick={() => setFillColor(fillColor === 'transparent' ? '#ffffff' : 'transparent')}
                style={toggleFill(fillColor !== 'transparent')}
                title={fillColor === 'transparent' ? 'Enable fill' : 'No fill'}
              >
                {fillColor === 'transparent' ? 'No fill' : 'Fill'}
              </button>
            </label>
            <label style={optLabel} title="Stroke width">
              <span style={optIcon}>W</span>
              <input
                type="range"
                min={1}
                max={10}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                style={{ width: 50 }}
              />
              <span style={{ fontSize: 10, minWidth: 14 }}>{strokeWidth}</span>
            </label>
            {activeTool === 'rect' && (
              <label style={optLabel} title="Corner radius">
                <span style={optIcon}>R</span>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={drawCornerRadius}
                  onChange={(e) => setDrawCornerRadius(parseInt(e.target.value))}
                  style={{ width: 50 }}
                />
                <span style={{ fontSize: 10, minWidth: 14 }}>{drawCornerRadius}</span>
              </label>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const container: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
};

const toolGroup: React.CSSProperties = {
  display: 'flex',
  gap: 1,
  background: '#EDF2F7',
  borderRadius: 4,
  padding: 1,
};

const toolBtn = (active: boolean): React.CSSProperties => ({
  padding: '4px 7px',
  fontSize: 10,
  fontWeight: 700,
  fontFamily: 'monospace',
  border: 'none',
  borderRadius: 3,
  background: active ? '#4299E1' : 'transparent',
  color: active ? '#FFFFFF' : '#4A5568',
  cursor: 'pointer',
  minWidth: 26,
  textAlign: 'center',
});

const separator: React.CSSProperties = {
  width: 1,
  height: 20,
  background: '#E2E8F0',
  margin: '0 4px',
};

const optionGroup: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const optLabel: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  fontSize: 10,
};

const optIcon: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  color: '#718096',
  minWidth: 10,
};

const colorInput: React.CSSProperties = {
  width: 20,
  height: 20,
  padding: 0,
  border: '1px solid #CBD5E0',
  borderRadius: 2,
  cursor: 'pointer',
};

const toggleFill = (active: boolean): React.CSSProperties => ({
  fontSize: 9,
  padding: '1px 4px',
  border: '1px solid #CBD5E0',
  borderRadius: 2,
  background: active ? '#EBF8FF' : '#F7FAFC',
  color: active ? '#2B6CB0' : '#A0AEC0',
  cursor: 'pointer',
});
