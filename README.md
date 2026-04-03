# konvajs-room-designer

A standalone, embeddable React room designer component built with [Konva.js](https://konvajs.org/). Design room layouts with tables, seats, and room elements (stages, bars, walls, etc.) on a canvas with drag-and-drop, alignment tools, and undo/redo.

## Features

- **Preset-driven tables**: Add tables from built-in presets (Round 6/8/10/12, Rectangle 6/8/10/12, Oval 8/10) with automatically computed seat positions
- **Room elements**: Stage, bar, dance floor, door, wall, column, podium, AV equipment, and custom elements
- **Canvas interaction**: Pan (middle-mouse/space+drag), zoom (scroll wheel), grid overlay with snap-to-grid
- **Selection**: Click, shift-click multi-select, marquee (rubber-band) selection
- **Transform**: Resize and rotate room elements via Konva Transformer
- **Alignment tools**: Align (left/center/right/top/middle/bottom), distribute (horizontal/vertical), arrange (grid/circle/diagonal)
- **Undo/redo**: Full history stack (50 steps) via Ctrl+Z / Ctrl+Shift+Z
- **Properties panel**: Edit selected item properties (label, color, size, rotation, opacity)
- **Settings panel**: Customize room dimensions, grid size, background color, and appearance theme
- **Context menu**: Right-click for quick actions (delete, duplicate, select all)
- **Keyboard shortcuts**: Delete, Ctrl+D (duplicate), Ctrl+A (select all), arrow keys (nudge), Escape (clear selection)
- **Web Worker architecture**: All state mutations and geometry computation run in a dedicated Web Worker for smooth 60fps canvas rendering
- **Valence compatibility**: Adapter functions to convert data to/from Valence seating chart format

## Installation

```bash
npm install konvajs-room-designer
```

### Peer Dependencies

```bash
npm install react react-dom konva react-konva
```

## Quick Start

```tsx
import { RoomDesigner } from 'konvajs-room-designer';

function App() {
  return (
    <RoomDesigner
      width={1200}
      height={800}
      onSave={(state) => {
        console.log('Saved:', state.room, state.tables);
      }}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialRoom` | `RoomLayout` | — | Initial room layout data |
| `initialTables` | `Table[]` | — | Initial tables with seats |
| `seatLayouts` | `SeatLayout[]` | — | Additional custom seat layout presets |
| `onSave` | `(state: WorkerState) => void` | — | Called when user clicks Save |
| `onChange` | `(state: WorkerState) => void` | — | Called on every state change |
| `onDiscard` | `() => void` | — | Called when user clicks Discard |
| `width` | `number` | `1200` | Component width in pixels |
| `height` | `number` | `800` | Component height in pixels |
| `readOnly` | `boolean` | `false` | Disable editing (hides sidebar and tools) |

## Imperative Handle

```tsx
import { useRef } from 'react';
import { RoomDesigner, type RoomDesignerHandle } from 'konvajs-room-designer';

function App() {
  const ref = useRef<RoomDesignerHandle>(null);

  return (
    <>
      <RoomDesigner ref={ref} width={1200} height={800} />
      <button onClick={() => ref.current?.zoomToFit()}>Fit to View</button>
      <button onClick={() => ref.current?.undo()}>Undo</button>
      <button onClick={async () => {
        const state = await ref.current?.getState();
        console.log(state);
      }}>
        Get State
      </button>
    </>
  );
}
```

## Valence Adapter

Convert between the room designer's internal format and Valence-compatible data:

```tsx
import {
  toValenceRoomLayout,
  fromValenceRoomLayout,
  toValencePlanTable,
  fromValencePlanTable,
} from 'konvajs-room-designer';

// Export to Valence format (snake_case, numeric IDs)
const valenceRoom = toValenceRoomLayout(state.room);
const valenceTables = state.tables.map((t, i) => toValencePlanTable(t, i));

// Import from Valence format
const room = fromValenceRoomLayout(valenceData);
```

## Built-in Presets

### Table Presets

| Preset | Shape | Seats | Layout |
|--------|-------|-------|--------|
| Round 6-Top | round | 6 | Evenly spaced around circumference |
| Round 8-Top | round | 8 | Evenly spaced around circumference |
| Round 10-Top | round | 10 | Evenly spaced around circumference |
| Round 12-Top | round | 12 | Evenly spaced around circumference |
| Rectangle 6-Seat | rectangle | 6 | L:2 R:2 T:1 B:1 |
| Rectangle 8-Seat | rectangle | 8 | L:3 R:3 T:1 B:1 |
| Rectangle 10-Seat | rectangle | 10 | L:3 R:3 T:2 B:2 |
| Rectangle 12-Seat | rectangle | 12 | L:4 R:4 T:2 B:2 |
| Oval 8-Seat | oval | 8 | L:3 R:3 T:1 B:1 |
| Oval 10-Seat | oval | 10 | L:4 R:4 T:1 B:1 |

### Room Elements

Stage, Bar, Dance Floor, Door, Wall, Column, Podium, AV Equipment

## Architecture

The component uses a Web Worker for stability and performance:

```
Main Thread (React + Konva)          Worker Thread
┌────────────────────────┐          ┌──────────────────────┐
│ User interactions       │──RPC──▶│ State mutations       │
│ Canvas rendering        │         │ Seat position compute │
│ Viewport (pan/zoom)     │◀─sync──│ Alignment geometry    │
│ Selection state         │         │ Undo/redo history     │
│ UI components           │         │ Valence adapters      │
└────────────────────────┘          └──────────────────────┘
```

- **Comlink** provides typed RPC between main thread and worker
- **Zustand** stores on main thread sync from worker results
- Drag operations use optimistic updates on main thread for 60fps feedback

## Custom Seat Layouts

```tsx
import { RoomDesigner, type SeatLayout } from 'konvajs-room-designer';

const customLayouts: SeatLayout[] = [
  {
    id: 'banquet-20',
    name: 'Banquet 20-Seat',
    seatCount: 20,
    leftCount: 8,
    rightCount: 8,
    topCount: 2,
    bottomCount: 2,
    tableShape: 'rectangle',
    isDefault: false,
  },
];

<RoomDesigner seatLayouts={customLayouts} width={1200} height={800} />
```

## Development

```bash
git clone https://github.com/jarredcain/konvajs-room-designer.git
cd konvajs-room-designer
npm install
npm run dev      # Dev server at localhost:5173
npm run build    # Library build to dist/
npm run test     # Run tests
```

## License

MIT
