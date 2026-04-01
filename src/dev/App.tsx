import { useCallback, useRef, useState, useEffect } from 'react';
import { RoomDesigner } from '../RoomDesigner';
import type { RoomDesignerHandle } from '../RoomDesigner';
import type { WorkerState } from '../types/worker-messages';

export function App() {
  const designerRef = useRef<RoomDesignerHandle>(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSave = useCallback((state: WorkerState) => {
    console.log('Save:', state);
    alert(`Saved! ${state.tables.length} tables, ${state.room.elements.length} elements`);
  }, []);

  const handleDiscard = useCallback(() => {
    console.log('Discard');
  }, []);

  return (
    <RoomDesigner
      ref={designerRef}
      width={dimensions.width}
      height={dimensions.height}
      onSave={handleSave}
      onDiscard={handleDiscard}
    />
  );
}
