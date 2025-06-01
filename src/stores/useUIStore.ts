import { create } from 'zustand';
import { Row } from '../types/row';

interface UIStore {
  // State
  timelinePanelRef: { current: HTMLDivElement | null } | null;
  dataPanelRef: { current: HTMLDivElement | null } | null;
  previousScrollPosition: number;
  selectedRowId: string | null;
  externalGetSelectedRow?: (row: Row) => void;
  ButtonContainer?: React.FC;
  rowCustomComponent?: React.FC<{ row: Row; isCompactView: boolean }>;
  rowHeight: number;
  isProgrammaticScroll: boolean;

  // Actions
  setTimelinePanelRef: (ref: React.RefObject<HTMLDivElement>) => void;
  setDataPanelRef: (ref: React.RefObject<HTMLDivElement>) => void;
  setPreviousScrollPosition: (position: number) => void;
  setSelectedRowId: (id: string | null) => void;
  setExternalGetSelectedRow: (fn: ((row: Row) => void) | undefined) => void;
  setButtonContainer: (component: React.FC | undefined) => void;
  setRowCustomComponent: (component: React.FC<{ row: Row }> | undefined) => void;
  setRowHeight: (height: number) => void;
  setIsProgrammaticScroll: (value: boolean) => void;
}

export const useUIStore = create<UIStore>(set => ({
  // State
  timelinePanelRef: null,
  dataPanelRef: null,
  previousScrollPosition: 0,
  selectedRowId: null,
  externalGetSelectedRow: undefined,
  ButtonContainer: undefined,
  rowHeight: 40,
  isProgrammaticScroll: false,

  // Actions
  setTimelinePanelRef: ref => {
    set({ timelinePanelRef: ref });
  },
  setDataPanelRef: ref => set({ dataPanelRef: ref }),
  setPreviousScrollPosition: position => set({ previousScrollPosition: position }),
  setSelectedRowId: id => set({ selectedRowId: id }),
  setExternalGetSelectedRow: fn => set({ externalGetSelectedRow: fn }),
  setButtonContainer: component => set({ ButtonContainer: component }),
  setRowCustomComponent: component => set({ rowCustomComponent: component }),
  setRowHeight: height => set({ rowHeight: height }),
  setIsProgrammaticScroll: value => set({ isProgrammaticScroll: value }),
}));
