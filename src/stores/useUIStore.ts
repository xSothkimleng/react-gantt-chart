import { create } from 'zustand';
import { Row } from '../types/row';

interface UIStore {
  // State
  timelinePanelRef: { current: HTMLDivElement | null } | null;
  previousScrollPosition: number;
  selectedRowId: string | null;
  externalGetSelectedRow?: (row: Row) => void;
  ButtonContainer?: React.FC;

  // Actions
  setTimelinePanelRef: (ref: React.RefObject<HTMLDivElement>) => void;
  setPreviousScrollPosition: (position: number) => void;
  setSelectedRowId: (id: string | null) => void;
  setExternalGetSelectedRow: (fn: ((row: Row) => void) | undefined) => void;
  setButtonContainer: (component: React.FC | undefined) => void;
}

export const useUIStore = create<UIStore>(set => ({
  // State
  timelinePanelRef: null,
  previousScrollPosition: 0,
  selectedRowId: null,
  externalGetSelectedRow: undefined,
  ButtonContainer: undefined,

  // Actions
  setTimelinePanelRef: ref => {
    if (ref && ref.current) {
      set({ timelinePanelRef: { current: ref.current } });
    }
  },
  setPreviousScrollPosition: position => set({ previousScrollPosition: position }),
  setSelectedRowId: id => set({ selectedRowId: id }),
  setExternalGetSelectedRow: fn => set({ externalGetSelectedRow: fn }),
  setButtonContainer: component => set({ ButtonContainer: component }),
}));
