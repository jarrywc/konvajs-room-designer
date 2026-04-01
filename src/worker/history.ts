import type { WorkerState } from '../types/worker-messages';
import { MAX_UNDO_STEPS } from '../utils/constants';

export interface HistoryManager {
  push(state: WorkerState): void;
  undo(current: WorkerState): WorkerState | null;
  redo(current: WorkerState): WorkerState | null;
  canUndo(): boolean;
  canRedo(): boolean;
  clear(): void;
}

export function createHistoryManager(): HistoryManager {
  const undoStack: WorkerState[] = [];
  const redoStack: WorkerState[] = [];

  return {
    push(state: WorkerState) {
      undoStack.push(structuredClone(state));
      if (undoStack.length > MAX_UNDO_STEPS) {
        undoStack.shift();
      }
      redoStack.length = 0;
    },

    undo(current: WorkerState): WorkerState | null {
      if (undoStack.length === 0) return null;
      const prev = undoStack.pop()!;
      redoStack.push(structuredClone(current));
      if (redoStack.length > MAX_UNDO_STEPS) {
        redoStack.shift();
      }
      return prev;
    },

    redo(current: WorkerState): WorkerState | null {
      if (redoStack.length === 0) return null;
      const next = redoStack.pop()!;
      undoStack.push(structuredClone(current));
      if (undoStack.length > MAX_UNDO_STEPS) {
        undoStack.shift();
      }
      return next;
    },

    canUndo() {
      return undoStack.length > 0;
    },

    canRedo() {
      return redoStack.length > 0;
    },

    clear() {
      undoStack.length = 0;
      redoStack.length = 0;
    },
  };
}
