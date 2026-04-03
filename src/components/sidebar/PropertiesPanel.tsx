import { useState, useCallback, useEffect } from 'react';
import { useSelectionStore } from '../../store/selection-store';
import { useRenderStore } from '../../store/render-store';
import type { RoomElement } from '../../types/room';
import type { Table, SeatShape } from '../../types/table';

interface PropertiesPanelProps {
  onUpdateElement: (id: string, changes: Partial<RoomElement>) => void;
  onRotateTable: (tableId: string, angle: number) => void;
  onUpdateTable: (tableId: string, changes: Partial<Table>) => void;
}

export function PropertiesPanel({ onUpdateElement, onRotateTable, onUpdateTable }: PropertiesPanelProps) {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const tables = useRenderStore((s) => s.tables);
  const elements = useRenderStore((s) => s.room.elements);

  if (selectedIds.size !== 1) return null;

  const id = [...selectedIds][0]!;
  const table = tables.find((t) => t.id === id);
  const element = elements.find((e) => e.id === id);

  if (table) return <TableProperties table={table} onRotate={onRotateTable} onUpdateTable={onUpdateTable} />;
  if (element) return <ElementProperties element={element} onUpdate={onUpdateElement} />;
  return null;
}

function TableProperties({ table, onRotate, onUpdateTable }: {
  table: Table;
  onRotate: (id: string, angle: number) => void;
  onUpdateTable?: (id: string, changes: Partial<Table>) => void;
}) {
  const [rotation, setRotation] = useState(String(table.rotation));
  const [cr, setCr] = useState(String(table.cornerRadius ?? 4));

  useEffect(() => setRotation(String(table.rotation)), [table.rotation]);
  useEffect(() => setCr(String(table.cornerRadius ?? 4)), [table.cornerRadius]);

  const commitRotation = useCallback(() => {
    const val = parseFloat(rotation);
    if (!isNaN(val)) onRotate(table.id, val);
  }, [rotation, table.id, onRotate]);

  return (
    <div style={container}>
      <div style={sectionLabel}>Table Properties</div>
      <div style={field}>
        <label style={labelStyle}>Name</label>
        <span style={valueStyle}>{table.name}</span>
      </div>
      <div style={field}>
        <label style={labelStyle}>Seats</label>
        <span style={valueStyle}>{table.seats.length}</span>
      </div>
      <div style={field}>
        <label style={labelStyle}>Position</label>
        <span style={valueStyle}>{table.x}, {table.y}</span>
      </div>
      <div style={field}>
        <label style={labelStyle}>Rotation</label>
        <input
          type="number"
          value={rotation}
          onChange={(e) => setRotation(e.target.value)}
          onBlur={commitRotation}
          onKeyDown={(e) => e.key === 'Enter' && commitRotation()}
          style={inputStyle}
        />
      </div>
      <div style={field}>
        <label style={labelStyle}>Corners</label>
        <input
          type="number"
          min={0}
          max={30}
          value={cr}
          onChange={(e) => setCr(e.target.value)}
          onBlur={() => {
            const v = parseInt(cr);
            if (!isNaN(v) && v >= 0 && onUpdateTable) onUpdateTable(table.id, { cornerRadius: v });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const v = parseInt(cr);
              if (!isNaN(v) && v >= 0 && onUpdateTable) onUpdateTable(table.id, { cornerRadius: v });
            }
          }}
          style={inputStyle}
        />
      </div>
      <div style={field}>
        <label style={labelStyle}>Seat Shape</label>
        <div style={{ display: 'flex', gap: 2 }}>
          {([['circle', 'O'], ['square', '[]'], ['rounded_rect', '()']] as [SeatShape, string][]).map(([shape, icon]) => (
            <button
              key={shape}
              onClick={() => onUpdateTable?.(table.id, { seatShape: shape })}
              style={{
                padding: '2px 6px',
                fontSize: 9,
                fontWeight: 700,
                fontFamily: 'monospace',
                border: '1px solid #CBD5E0',
                borderRadius: 3,
                background: (table.seatShape ?? 'circle') === shape ? '#4299E1' : '#F7FAFC',
                color: (table.seatShape ?? 'circle') === shape ? '#FFFFFF' : '#4A5568',
                cursor: 'pointer',
              }}
              title={shape.replace('_', ' ')}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ElementProperties({
  element,
  onUpdate,
}: {
  element: RoomElement;
  onUpdate: (id: string, changes: Partial<RoomElement>) => void;
}) {
  const [label, setLabel] = useState(element.label ?? '');
  const [fillColor, setFillColor] = useState(element.fillColor);
  const [opacity, setOpacity] = useState(String(element.opacity));
  const [w, setW] = useState(String(element.width));
  const [h, setH] = useState(String(element.height));
  const [rotation, setRotation] = useState(String(element.rotation));
  const [cr, setCr] = useState(String(element.cornerRadius ?? 0));

  const isText = element.elementType === 'text';
  const showCornerRadius = !isText && !['column', 'figure_ellipse', 'figure_line', 'figure_freehand'].includes(element.elementType);

  // Text-specific state
  const cfg = element.config ?? {};
  const [textContent, setTextContent] = useState((cfg.text as string) ?? '');
  const [fontSize, setFontSize] = useState(String((cfg.fontSize as number) ?? 16));
  const [textColor, setTextColor] = useState((cfg.textColor as string) ?? '#2D3748');

  useEffect(() => {
    setLabel(element.label ?? '');
    setFillColor(element.fillColor);
    setOpacity(String(element.opacity));
    setW(String(element.width));
    setH(String(element.height));
    setRotation(String(element.rotation));
    setCr(String(element.cornerRadius ?? 0));
    if (isText) {
      const c = element.config ?? {};
      setTextContent((c.text as string) ?? '');
      setFontSize(String((c.fontSize as number) ?? 16));
      setTextColor((c.textColor as string) ?? '#2D3748');
    }
  }, [element, isText]);

  const commit = useCallback(
    (changes: Partial<RoomElement>) => onUpdate(element.id, changes),
    [element.id, onUpdate]
  );

  return (
    <div style={container}>
      <div style={sectionLabel}>{element.elementType.replace('_', ' ')} Properties</div>
      {!isText && (
        <div style={field}>
          <label style={labelStyle}>Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => commit({ label })}
            style={inputStyle}
          />
        </div>
      )}
      <div style={field}>
        <label style={labelStyle}>Size</label>
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            type="number"
            value={w}
            onChange={(e) => setW(e.target.value)}
            onBlur={() => { const v = parseInt(w); if (v > 0) commit({ width: v }); }}
            style={{ ...inputStyle, width: 50 }}
          />
          <span style={{ fontSize: 10, color: '#718096', lineHeight: '24px' }}>x</span>
          <input
            type="number"
            value={h}
            onChange={(e) => setH(e.target.value)}
            onBlur={() => { const v = parseInt(h); if (v > 0) commit({ height: v }); }}
            style={{ ...inputStyle, width: 50 }}
          />
        </div>
      </div>
      <div style={field}>
        <label style={labelStyle}>Rotation</label>
        <input
          type="number"
          value={rotation}
          onChange={(e) => setRotation(e.target.value)}
          onBlur={() => { const v = parseFloat(rotation); if (!isNaN(v)) commit({ rotation: v }); }}
          style={inputStyle}
        />
      </div>
      {!isText && (
        <div style={field}>
          <label style={labelStyle}>Fill</label>
          <input
            type="color"
            value={fillColor}
            onChange={(e) => { setFillColor(e.target.value); commit({ fillColor: e.target.value }); }}
            style={{ ...inputStyle, padding: 1, height: 26, width: 40 }}
          />
        </div>
      )}
      <div style={field}>
        <label style={labelStyle}>Opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(e) => { setOpacity(e.target.value); commit({ opacity: parseFloat(e.target.value) }); }}
          style={{ flex: 1 }}
        />
      </div>
      {showCornerRadius && (
        <div style={field}>
          <label style={labelStyle}>Corners</label>
          <input
            type="number"
            min={0}
            max={30}
            value={cr}
            onChange={(e) => setCr(e.target.value)}
            onBlur={() => { const v = parseInt(cr); if (!isNaN(v) && v >= 0) commit({ cornerRadius: v }); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { const v = parseInt(cr); if (!isNaN(v) && v >= 0) commit({ cornerRadius: v }); } }}
            style={inputStyle}
          />
        </div>
      )}
      {isText && (
        <>
          <div style={field}>
            <label style={labelStyle}>Text</label>
            <input
              type="text"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              onBlur={() => commit({ config: { ...cfg, text: textContent } })}
              onKeyDown={(e) => { if (e.key === 'Enter') commit({ config: { ...cfg, text: textContent } }); }}
              style={inputStyle}
            />
          </div>
          <div style={field}>
            <label style={labelStyle}>Font Size</label>
            <input
              type="number"
              min={8}
              max={72}
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              onBlur={() => { const v = parseInt(fontSize); if (v > 0) commit({ config: { ...cfg, fontSize: v } }); }}
              style={{ ...inputStyle, width: 50 }}
            />
          </div>
          <div style={field}>
            <label style={labelStyle}>Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => { setTextColor(e.target.value); commit({ config: { ...cfg, textColor: e.target.value } }); }}
              style={{ ...inputStyle, padding: 1, height: 26, width: 40 }}
            />
          </div>
          <div style={field}>
            <label style={labelStyle}>Weight</label>
            <div style={{ display: 'flex', gap: 2 }}>
              {(['normal', 'bold'] as const).map((fw) => (
                <button
                  key={fw}
                  onClick={() => commit({ config: { ...cfg, fontWeight: fw } })}
                  style={{
                    padding: '2px 6px',
                    fontSize: 9,
                    fontWeight: fw === 'bold' ? 700 : 400,
                    border: '1px solid #CBD5E0',
                    borderRadius: 3,
                    background: (cfg.fontWeight ?? 'normal') === fw ? '#4299E1' : '#F7FAFC',
                    color: (cfg.fontWeight ?? 'normal') === fw ? '#FFFFFF' : '#4A5568',
                    cursor: 'pointer',
                  }}
                >
                  {fw === 'bold' ? 'B' : 'N'}
                </button>
              ))}
            </div>
          </div>
          <div style={field}>
            <label style={labelStyle}>Align</label>
            <div style={{ display: 'flex', gap: 2 }}>
              {(['left', 'center', 'right'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => commit({ config: { ...cfg, align: a } })}
                  style={{
                    padding: '2px 6px',
                    fontSize: 9,
                    border: '1px solid #CBD5E0',
                    borderRadius: 3,
                    background: (cfg.align ?? 'center') === a ? '#4299E1' : '#F7FAFC',
                    color: (cfg.align ?? 'center') === a ? '#FFFFFF' : '#4A5568',
                    cursor: 'pointer',
                  }}
                >
                  {a[0]!.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const container: React.CSSProperties = {
  padding: '8px 10px',
  borderTop: '1px solid #E2E8F0',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#718096',
  marginBottom: 6,
};

const field: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  marginBottom: 4,
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#4A5568',
  minWidth: 48,
};

const valueStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#2D3748',
};

const inputStyle: React.CSSProperties = {
  fontSize: 11,
  padding: '2px 4px',
  border: '1px solid #E2E8F0',
  borderRadius: 3,
  width: 70,
};
