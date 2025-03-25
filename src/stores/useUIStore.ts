// src/stores/useUIStore.ts
import { create } from 'zustand';

interface UIState {
  isLoading: boolean;
  collapsedItems: Set<string>;

  setIsLoading: (loading: boolean) => void;
  toggleCollapse: (itemId: string) => void;
}

export const useUIStore = create<UIState>(set => ({
  isLoading: false,
  collapsedItems: new Set<string>(),

  setIsLoading: loading => set({ isLoading: loading }),
  toggleCollapse: itemId =>
    set(state => {
      const newCollapsedItems = new Set(state.collapsedItems);
      if (newCollapsedItems.has(itemId)) {
        newCollapsedItems.delete(itemId);
      } else {
        newCollapsedItems.add(itemId);
      }
      return { collapsedItems: newCollapsedItems };
    }),
}));
