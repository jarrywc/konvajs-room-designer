import { useSettingsStore } from '../../store/settings-store';
import { useRenderStore } from '../../store/render-store';

interface SettingsPanelProps {
  onSetRoomProperties: (props: Record<string, unknown>) => void;
}

export function SettingsPanel({ onSetRoomProperties }: SettingsPanelProps) {
  const theme = useSettingsStore((s) => s.theme);
  const seatColor = useSettingsStore((s) => s.seatColor);
  const tableColor = useSettingsStore((s) => s.tableColor);
  const selectedColor = useSettingsStore((s) => s.selectedColor);
  const gridColor = useSettingsStore((s) => s.gridColor);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setSeatColor = useSettingsStore((s) => s.setSeatColor);
  const setTableColor = useSettingsStore((s) => s.setTableColor);
  const setSelectedColor = useSettingsStore((s) => s.setSelectedColor);
  const setGridColor = useSettingsStore((s) => s.setGridColor);
  const seatGaps = useSettingsStore((s) => s.seatGaps);
  const setSeatGap = useSettingsStore((s) => s.setSeatGap);

  const roomName = useRenderStore((s) => s.room.name);
  const roomW = useRenderStore((s) => s.room.widthPx);
  const roomH = useRenderStore((s) => s.room.heightPx);
  const gridSize = useRenderStore((s) => s.room.gridSize);
  const bgColor = useRenderStore((s) => s.room.backgroundColor);

  return (
    <div style={container}>
      <div style={sectionLabel}>Room</div>
      <div style={field}>
        <label style={label}>Name</label>
        <input
          type="text"
          defaultValue={roomName}
          onBlur={(e) => onSetRoomProperties({ name: e.target.value })}
          style={input}
        />
      </div>
      <div style={field}>
        <label style={label}>Size</label>
        <input
          type="number"
          defaultValue={roomW}
          onBlur={(e) => { const v = parseInt(e.target.value); if (v > 0) onSetRoomProperties({ widthPx: v }); }}
          style={{ ...input, width: 55 }}
        />
        <span style={xStyle}>x</span>
        <input
          type="number"
          defaultValue={roomH}
          onBlur={(e) => { const v = parseInt(e.target.value); if (v > 0) onSetRoomProperties({ heightPx: v }); }}
          style={{ ...input, width: 55 }}
        />
      </div>
      <div style={field}>
        <label style={label}>Grid</label>
        <input
          type="number"
          defaultValue={gridSize}
          min={5}
          max={100}
          onBlur={(e) => { const v = parseInt(e.target.value); if (v >= 5) onSetRoomProperties({ gridSize: v }); }}
          style={{ ...input, width: 50 }}
        />
      </div>
      <div style={field}>
        <label style={label}>Background</label>
        <input
          type="color"
          defaultValue={bgColor}
          onChange={(e) => onSetRoomProperties({ backgroundColor: e.target.value })}
          style={{ ...input, padding: 1, height: 24, width: 36 }}
        />
      </div>

      <div style={{ ...sectionLabel, marginTop: 12 }}>Appearance</div>
      <div style={field}>
        <label style={label}>Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
          style={input}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div style={field}>
        <label style={label}>Seat color</label>
        <input type="color" value={seatColor} onChange={(e) => setSeatColor(e.target.value)} style={colorInput} />
      </div>
      <div style={field}>
        <label style={label}>Table color</label>
        <input type="color" value={tableColor} onChange={(e) => setTableColor(e.target.value)} style={colorInput} />
      </div>
      <div style={field}>
        <label style={label}>Selected</label>
        <input type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} style={colorInput} />
      </div>
      <div style={field}>
        <label style={label}>Grid color</label>
        <input type="color" value={gridColor} onChange={(e) => setGridColor(e.target.value)} style={colorInput} />
      </div>

      <div style={{ ...sectionLabel, marginTop: 12 }}>Seat Gaps</div>
      <div style={{ fontSize: 9, color: '#A0AEC0', marginBottom: 4 }}>
        Distance from table edge to seats (px)
      </div>
      {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
        <div key={side} style={field}>
          <label style={label}>{side[0]!.toUpperCase() + side.slice(1)}</label>
          <input
            type="range"
            min={0}
            max={30}
            value={seatGaps[side]}
            onChange={(e) => setSeatGap(side, parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 10, minWidth: 16, textAlign: 'right', color: '#4A5568' }}>{seatGaps[side]}</span>
        </div>
      ))}
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
  gap: 4,
  marginBottom: 4,
};

const label: React.CSSProperties = {
  fontSize: 10,
  color: '#4A5568',
  minWidth: 52,
};

const input: React.CSSProperties = {
  fontSize: 11,
  padding: '2px 4px',
  border: '1px solid #E2E8F0',
  borderRadius: 3,
  width: 80,
};

const colorInput: React.CSSProperties = {
  ...input,
  padding: 1,
  height: 24,
  width: 36,
};

const xStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#718096',
};
