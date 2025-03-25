// src/stores/useUIStore.ts
import { create } from 'zustand';
import { DateRangeType } from '../types/dateRangeType';

interface UIState {
  // UI state
  isLoading: boolean;
  chartDateRange: DateRangeType;
  collapsedItems: Set<string>;
  showSidebar: boolean;
  activeDataIndex: number | null;

  // refs as store values (could be moved to a separate refs store)
  timelinePanelRef: React.RefObject<HTMLDivElement> | null;

  // UI actions
  setIsLoading: (loading: boolean) => void;
  setChartDateRange: (dateRange: DateRangeType) => void;
  toggleCollapse: (itemId: string) => void;
  setShowSidebar: (show: boolean) => void;
  setActiveDataIndex: (index: number | null) => void;
  setTimelinePanelRef: (ref: React.RefObject<HTMLDivElement>) => void;
}

export const useUIStore = create<UIState>(set => ({
  isLoading: false,
  chartDateRange: [],
  collapsedItems: new Set<string>(),
  showSidebar: true,
  activeDataIndex: null,
  timelinePanelRef: null,

  setIsLoading: loading => set({ isLoading: loading }),
  setChartDateRange: dateRange => set({ chartDateRange: dateRange }),

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

  setShowSidebar: show => set({ showSidebar: show }),
  setActiveDataIndex: index => set({ activeDataIndex: index }),
  setTimelinePanelRef: ref => set({ timelinePanelRef: ref }),
}));
