import { TABLE_PRESETS } from '../../presets/table-presets';
import { getSeatLayout } from '../../presets/seat-layouts';

interface TablePresetListProps {
  onAddTable: (presetId: string) => void;
}

export function TablePresetList({ onAddTable }: TablePresetListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={sectionLabel}>Tables</div>
      {TABLE_PRESETS.map((preset) => {
        const layout = getSeatLayout(preset.seatLayoutId);
        return (
          <button
            key={preset.id}
            onClick={() => onAddTable(preset.id)}
            style={presetBtn}
          >
            <span style={{ fontWeight: 600, fontSize: 12 }}>{preset.icon}</span>
            <span style={{ fontSize: 11 }}>{preset.name}</span>
            {layout && (
              <span style={{ fontSize: 10, color: '#718096' }}>
                {layout.seatCount} seats
              </span>
            )}
          </button>
        );
      })}
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
};

const presetBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '6px 8px',
  background: '#F7FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: 4,
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: 12,
};
