import { useCallback } from 'react';
import { ROOM_ELEMENT_CATALOG } from '../../presets/element-catalog';
import type { RoomElementType } from '../../types/room';

interface ElementCatalogProps {
  onAddElement: (type: RoomElementType) => void;
}

export function ElementCatalog({ onAddElement }: ElementCatalogProps) {
  const handleDragStart = useCallback((e: React.DragEvent, type: RoomElementType) => {
    e.dataTransfer.setData('application/room-designer-element', type);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={sectionLabel}>Room Elements</div>
      {ROOM_ELEMENT_CATALOG.map((entry) => (
        <button
          key={entry.type}
          draggable
          onDragStart={(e) => handleDragStart(e, entry.type)}
          onClick={() => onAddElement(entry.type)}
          style={catalogBtn}
        >
          <span style={{ fontWeight: 600, fontSize: 12 }}>{entry.icon}</span>
          <span style={{ fontSize: 11 }}>{entry.label}</span>
          <span style={{ fontSize: 10, color: '#718096' }}>
            {entry.defaultWidth}x{entry.defaultHeight}
          </span>
        </button>
      ))}
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#718096',
  padding: '4px 0',
  marginTop: 12,
};

const catalogBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 8px',
  background: '#F7FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: 4,
  cursor: 'grab',
  textAlign: 'left',
  fontSize: 12,
};
