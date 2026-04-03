import { useEffect, useRef } from 'react';

export interface ContextMenuItem {
  label: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div ref={ref} style={{ ...menu, left: x, top: y }}>
      {items.map((item, i) =>
        item.separator ? (
          <div key={i} style={separatorStyle} />
        ) : (
          <button
            key={i}
            onClick={() => {
              if (!item.disabled) {
                item.action();
                onClose();
              }
            }}
            disabled={item.disabled}
            style={{
              ...menuItem,
              opacity: item.disabled ? 0.4 : 1,
              cursor: item.disabled ? 'default' : 'pointer',
            }}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

const menu: React.CSSProperties = {
  position: 'fixed',
  zIndex: 9999,
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 6,
  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  padding: '4px 0',
  minWidth: 140,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const menuItem: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '6px 14px',
  fontSize: 12,
  textAlign: 'left',
  border: 'none',
  background: 'transparent',
};

const separatorStyle: React.CSSProperties = {
  height: 1,
  background: '#E2E8F0',
  margin: '4px 0',
};
