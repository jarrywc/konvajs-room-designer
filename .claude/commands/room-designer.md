# Room Designer Development Guide

## Project Overview
Standalone Konva.js room designer component for embedding in the Valence seating chart application.

## Architecture
- **Web Worker** owns authoritative state (room layout, tables, seats, elements, undo/redo)
- **Main thread** owns rendering (Konva canvas), viewport (pan/zoom), selection, and UI
- **Comlink** provides typed RPC bridge between threads
- **Zustand** stores on main thread sync from worker results

## Key Patterns

### Adding a new worker command
1. Define the message type in `src/types/worker-messages.ts`
2. Add handler in `src/worker/handlers.ts`
3. Expose via Comlink API in `src/worker/designer.worker.ts`
4. Call from main thread via `useWorker()` hook

### Adding a new table preset
1. Add SeatLayout in `src/presets/seat-layouts.ts`
2. Add TablePreset in `src/presets/table-presets.ts`
3. Seat positions are auto-computed by `src/worker/geometry/seat-positions.ts`

### Adding a new room element type
1. Add type to `RoomElementType` union in `src/types/room.ts`
2. Add catalog entry in `src/presets/element-catalog.ts`
3. Create renderer in `src/components/elements/`
4. Register in `RoomElementGroup.tsx` switch

### State flow
```
User action -> Main thread sends command via Comlink -> Worker
Worker mutates state + pushes undo -> Returns updated state
Bridge syncs -> Zustand render-store -> React re-renders Konva
```

### Optimistic updates (drag)
During drag: main thread updates position locally for 60fps feedback.
On drag-end: sends final position to worker for snap/collision/history commit.

## Valence Compatibility
- Internal types use camelCase + string IDs
- Valence types use snake_case + numeric IDs  
- Adapters in `src/worker/adapters/` convert between them
- Reference: `/Users/jarredcain/valence/src/shared/types.ts`

## Testing
- `npm run test` -- vitest suite
- `npm run dev` -- dev harness at localhost
- Key test targets: seat position geometry, adapters, alignment functions

## Plan File
Full implementation plan at: `.claude/plans/frolicking-puzzling-sketch.md`
