import type { RoomElementType } from '../../types/room';
import { TablePresetList } from './TablePresetList';
import { ElementCatalog } from './ElementCatalog';

interface SidebarProps {
  onAddTable: (presetId: string) => void;
  onAddElement: (type: RoomElementType) => void;
}

export function Sidebar({ onAddTable, onAddElement }: SidebarProps) {
  return (
    <div style={container}>
      <div style={header}>Library</div>
      <div style={scrollArea}>
        <TablePresetList onAddTable={onAddTable} />
        <ElementCatalog onAddElement={onAddElement} />
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  width: 220,
  height: '100%',
  borderRight: '1px solid #E2E8F0',
  background: '#FFFFFF',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const header: React.CSSProperties = {
  padding: '10px 12px',
  fontWeight: 700,
  fontSize: 13,
  borderBottom: '1px solid #E2E8F0',
  color: '#2D3748',
};

const scrollArea: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '8px 10px',
};
