# Room Designer Development Guide

## Project Overview
Standalone Konva.js room designer component for embedding in the Valence seating chart application. Published as `konvajs-room-designer` on npm.

## Architecture
- **Web Worker** (`src/worker/`) owns authoritative state (room layout, tables, seats, elements, undo/redo)
- **Main thread** owns rendering (Konva canvas), viewport (pan/zoom), selection, and UI
- **Comlink** provides typed RPC bridge (`src/bridge/`) between threads
- **Zustand** stores (`src/store/`) on main thread sync from worker results

## Key Files
- `src/RoomDesigner.tsx` — Top-level embeddable component (props, keyboard shortcuts, context menu)
- `src/worker/designer.worker.ts` — Worker entry point (Comlink-exposed API)
- `src/worker/state.ts` — `DesignerState` class with all mutation methods
- `src/worker/history.ts` — Snapshot-based undo/redo stack (50 steps)
- `src/worker/geometry/seat-positions.ts` — Core seat position algorithm (round + rectangular)
- `src/worker/geometry/alignment.ts` — Align, distribute, arrange geometry functions
- `src/worker/adapters/` — Valence data format converters (snake_case <-> camelCase)
- `src/bridge/useWorker.ts` — React hook wrapping Comlink bridge
- `src/store/render-store.ts` — Zustand store synced from worker (read-only render state)
- `src/canvas/DesignerStage.tsx` — Konva Stage with pan/zoom/marquee/transformer
- `src/presets/seat-layouts.ts` — 10 built-in seat layout definitions matching Valence
- `src/index.ts` — Public API barrel export

## Key Patterns

### Adding a new worker command
1. Add method to `DesignerState` class in `src/worker/state.ts`
2. Expose via async method in `src/worker/designer.worker.ts`
3. Add type to `DesignerWorkerAPI` in `src/types/worker-messages.ts`
4. Add wrapper in `src/bridge/useWorker.ts`

### Adding a new table preset
1. Add `SeatLayout` in `src/presets/seat-layouts.ts`
2. Add `TablePreset` in `src/presets/table-presets.ts`
3. Seat positions are auto-computed by `src/worker/geometry/seat-positions.ts`

### Adding a new drawing tool
1. Add tool id to `DrawingTool` union in `src/store/canvas-store.ts`
2. Add draw state variant in `DrawState` union in `src/canvas/DrawingLayer.tsx`
3. Handle mouseDown/mouseMove/mouseUp/dblClick for the new tool in DrawingLayer
4. Add preview rendering in DrawingLayer's return JSX
5. Add element type to `RoomElementType` in `src/types/room.ts` (e.g. `figure_xxx`)
6. Add rendering case in `renderShape()` in `src/components/elements/GenericElement.tsx`
7. Add button to `TOOLS` array in `src/components/toolbar/DrawToolbar.tsx`
8. Add keyboard shortcut in RoomDesigner's `toolKeys` map

### Adding a new room element type
1. Add type to `RoomElementType` union in `src/types/room.ts`
2. Add catalog entry in `src/presets/element-catalog.ts`
3. Handle rendering in `src/components/elements/GenericElement.tsx` (or create a new specific renderer)

### State flow
```
User action → useWorker().someMethod() → Comlink RPC → Worker
Worker mutates DesignerState + pushes undo → Returns WorkerState
Bridge syncs → Zustand render-store → React re-renders Konva
```

### Optimistic updates (drag)
During drag: Konva handles position locally for 60fps feedback.
On dragEnd: sends final position to worker for snap/collision/history commit.

## Valence Compatibility
- Internal types: camelCase + string IDs (nanoid)
- Valence types: snake_case + numeric IDs
- Adapters in `src/worker/adapters/` convert between them
- Reference: `/Users/jarredcain/valence/src/shared/types.ts`

## Commands
- `npm run dev` — Dev server at localhost:5173
- `npm run build` — Library build to dist/ (ES module + .d.ts)
- `npm run test` — Vitest suite
- `npm run preview` — Preview production build

## npm Publish
- `npm run build` (also runs as `prepublishOnly`)
- `npm publish`
- Package exports: `dist/room-designer.js` + `dist/index.d.ts`
- Peer deps: react, react-dom, konva, react-konva
