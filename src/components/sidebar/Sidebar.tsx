import { useState } from 'react';
import type { RoomElementType, RoomElement } from '../../types/room';
import type { Table } from '../../types/table';
import type { AlignAxis, DistributeAxis, ArrangePattern } from '../../types/geometry';
import { TablePresetList } from './TablePresetList';
import { ElementCatalog } from './ElementCatalog';
import { PropertiesPanel } from './PropertiesPanel';
import { AlignmentPanel } from '../toolbar/AlignmentPanel';
import { SettingsPanel } from '../settings/SettingsPanel';

type SidebarTab = 'library' | 'settings';

interface SidebarProps {
  onAddTable: (presetId: string) => void;
  onAddElement: (type: RoomElementType) => void;
  onUpdateElement: (id: string, changes: Partial<RoomElement>) => void;
  onRotateTable: (tableId: string, angle: number) => void;
  onUpdateTable: (tableId: string, changes: Partial<Table>) => void;
  onAlign: (ids: string[], axis: AlignAxis) => void;
  onDistribute: (ids: string[], axis: DistributeAxis) => void;
  onArrange: (ids: string[], pattern: ArrangePattern) => void;
  onSetRoomProperties: (props: Record<string, unknown>) => void;
}

export function Sidebar({
  onAddTable,
  onAddElement,
  onUpdateElement,
  onRotateTable,
  onUpdateTable,
  onAlign,
  onDistribute,
  onArrange,
  onSetRoomProperties,
}: SidebarProps) {
  const [tab, setTab] = useState<SidebarTab>('library');

  return (
    <div style={container}>
      <div style={tabBar}>
        <button
          onClick={() => setTab('library')}
          style={tabBtn(tab === 'library')}
        >
          Library
        </button>
        <button
          onClick={() => setTab('settings')}
          style={tabBtn(tab === 'settings')}
        >
          Settings
        </button>
      </div>
      <div style={scrollArea}>
        {tab === 'library' && (
          <>
            <TablePresetList onAddTable={onAddTable} />
            <ElementCatalog onAddElement={onAddElement} />
            <AlignmentPanel onAlign={onAlign} onDistribute={onDistribute} onArrange={onArrange} />
          </>
        )}
        {tab === 'settings' && (
          <SettingsPanel onSetRoomProperties={onSetRoomProperties} />
        )}
        <PropertiesPanel onUpdateElement={onUpdateElement} onRotateTable={onRotateTable} onUpdateTable={onUpdateTable} />
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

const tabBar: React.CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid #E2E8F0',
};

const tabBtn = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '8px 0',
  fontSize: 11,
  fontWeight: active ? 700 : 400,
  border: 'none',
  borderBottom: active ? '2px solid #4299E1' : '2px solid transparent',
  background: 'transparent',
  color: active ? '#2B6CB0' : '#718096',
  cursor: 'pointer',
});

const scrollArea: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '8px 10px',
};
