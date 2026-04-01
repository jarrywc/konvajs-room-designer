import { create } from 'zustand';

interface SelectionStoreState {
  selectedIds: Set<string>;
  select: (id: string) => void;
  toggleSelect: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

export const useSelectionStore = create<SelectionStoreState>((set, get) => ({
  selectedIds: new Set<string>(),

  select: (id) => set({ selectedIds: new Set([id]) }),

  toggleSelect: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),

  selectMultiple: (ids) => set({ selectedIds: new Set(ids) }),

  clearSelection: () => set({ selectedIds: new Set() }),

  isSelected: (id) => get().selectedIds.has(id),
}));
