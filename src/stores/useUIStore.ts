import { create } from 'zustand';

interface UIState {
  activeDataIndex: number | null;

  // refs as store values
  timelinePanelRef: React.RefObject<HTMLDivElement> | null;

  // UI actions
  setActiveDataIndex: (index: number | null) => void;
  setTimelinePanelRef: (ref: React.RefObject<HTMLDivElement>) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeDataIndex: null,
  timelinePanelRef: null,

  setActiveDataIndex: index => {
    if (get().activeDataIndex !== index) {
      set({ activeDataIndex: index });
    }
  },

  setTimelinePanelRef: ref => {
    if (get().timelinePanelRef !== ref) {
      set({ timelinePanelRef: ref });
    }
  },
}));
