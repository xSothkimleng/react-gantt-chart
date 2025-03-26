// src/stores/useUIStore.ts
import { create } from 'zustand';

interface UIState {
  activeDataIndex: number | null;
  timelinePanelRef: { current: HTMLDivElement | null } | null;
  isTimelinePanelRefSet: boolean;

  // UI actions
  setActiveDataIndex: (index: number | null) => void;
  setTimelinePanelRef: (ref: React.RefObject<HTMLDivElement>) => void;
}

export const useUIStore = create<UIState>(set => ({
  activeDataIndex: null,
  timelinePanelRef: null,
  isTimelinePanelRefSet: false,

  setActiveDataIndex: index => {
    set({ activeDataIndex: index });
  },

  setTimelinePanelRef: ref => {
    // Only update if ref has a current value
    if (ref && ref.current) {
      set({
        timelinePanelRef: { current: ref.current },
        isTimelinePanelRefSet: true,
      });
    }
  },
}));
