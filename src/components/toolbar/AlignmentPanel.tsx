import type { AlignAxis, DistributeAxis, ArrangePattern } from '../../types/geometry';
import { useSelectionStore } from '../../store/selection-store';

interface AlignmentPanelProps {
  onAlign: (ids: string[], axis: AlignAxis) => void;
  onDistribute: (ids: string[], axis: DistributeAxis) => void;
  onArrange: (ids: string[], pattern: ArrangePattern) => void;
}

export function AlignmentPanel({ onAlign, onDistribute, onArrange }: AlignmentPanelProps) {
  const selectedIds = useSelectionStore((s) => s.selectedIds);
  const ids = [...selectedIds];
  const count = ids.length;
  const enabled = count >= 2;
  const distEnabled = count >= 3;

  return (
    <div style={container}>
      <div style={sectionLabel}>Align{enabled ? ` (${count})` : ''}</div>
      <div style={row}>
        <button onClick={() => onAlign(ids, 'left')} style={iconBtn(enabled)} title="Align left">L</button>
        <button onClick={() => onAlign(ids, 'center-h')} style={iconBtn(enabled)} title="Center horizontally">CH</button>
        <button onClick={() => onAlign(ids, 'right')} style={iconBtn(enabled)} title="Align right">R</button>
        <button onClick={() => onAlign(ids, 'top')} style={iconBtn(enabled)} title="Align top">T</button>
        <button onClick={() => onAlign(ids, 'center-v')} style={iconBtn(enabled)} title="Center vertically">CV</button>
        <button onClick={() => onAlign(ids, 'bottom')} style={iconBtn(enabled)} title="Align bottom">B</button>
      </div>
      <div style={sectionLabel}>Distribute</div>
      <div style={row}>
        <button onClick={() => onDistribute(ids, 'horizontal')} style={iconBtn(distEnabled)} title="Distribute horizontally">H</button>
        <button onClick={() => onDistribute(ids, 'vertical')} style={iconBtn(distEnabled)} title="Distribute vertically">V</button>
      </div>
      <div style={sectionLabel}>Arrange</div>
      <div style={row}>
        <button onClick={() => onArrange(ids, 'grid')} style={iconBtn(enabled)} title="Grid">#</button>
        <button onClick={() => onArrange(ids, 'circle')} style={iconBtn(enabled)} title="Circle">O</button>
        <button onClick={() => onArrange(ids, 'diagonal-tl')} style={iconBtn(enabled)} title="Diagonal">\</button>
        <button onClick={() => onArrange(ids, 'diagonal-tr')} style={iconBtn(enabled)} title="Diagonal">/</button>
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  padding: '8px 10px',
  borderTop: '1px solid #E2E8F0',
};

const sectionLabel: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#718096',
  marginTop: 4,
};

const row: React.CSSProperties = { display: 'flex', gap: 2, flexWrap: 'wrap' };

const iconBtn = (isEnabled: boolean): React.CSSProperties => ({
  padding: '3px 6px',
  fontSize: 10,
  fontWeight: 700,
  minWidth: 24,
  textAlign: 'center',
  border: '1px solid #E2E8F0',
  borderRadius: 3,
  background: '#F7FAFC',
  cursor: isEnabled ? 'pointer' : 'default',
  opacity: isEnabled ? 1 : 0.3,
  pointerEvents: isEnabled ? 'auto' : 'none',
});
