// src/stores/useUIStore.ts
import { create } from 'zustand';

interface UIState {
  activeDataIndex: number | null;
  timelinePanelRef: { current: HTMLDivElement | null } | null;

  // UI actions
  setActiveDataIndex: (index: number | null) => void;
  setTimelinePanelRef: (ref: React.RefObject<HTMLDivElement>) => void;
}

export const useUIStore = create<UIState>(set => ({
  activeDataIndex: null,
  timelinePanelRef: null,

  setActiveDataIndex: index => {
    set({ activeDataIndex: index });
  },

  setTimelinePanelRef: ref => {
    set({ timelinePanelRef: ref });
  },
}));
