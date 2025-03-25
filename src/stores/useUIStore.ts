import { create } from 'zustand';
import { DateRangeType } from '../types/dateRangeType';

interface UIState {
  // UI state
  isLoading: boolean;
  chartDateRange: DateRangeType;
  collapsedItems: Set<string>;
  showSidebar: boolean;
  activeDataIndex: number | null;

  // refs as store values
  timelinePanelRef: React.RefObject<HTMLDivElement> | null;

  // UI actions
  setIsLoading: (loading: boolean) => void;
  setChartDateRange: (dateRange: DateRangeType) => void;
  toggleCollapse: (itemId: string) => void;
  setShowSidebar: (show: boolean) => void;
  setActiveDataIndex: (index: number | null) => void;
  setTimelinePanelRef: (ref: React.RefObject<HTMLDivElement>) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isLoading: false,
  chartDateRange: [],
  collapsedItems: new Set<string>(),
  showSidebar: true,
  activeDataIndex: null,
  timelinePanelRef: null,

  // Optimize setters to avoid unnecessary updates
  setIsLoading: loading => {
    if (get().isLoading !== loading) {
      set({ isLoading: loading });
    }
  },

  setChartDateRange: dateRange => {
    // Only update if truly changed (shallow comparison should be sufficient for most cases)
    if (get().chartDateRange !== dateRange) {
      set({ chartDateRange: dateRange });
    }
  },

  toggleCollapse: itemId => {
    set(state => {
      const newCollapsedItems = new Set(state.collapsedItems);
      if (newCollapsedItems.has(itemId)) {
        newCollapsedItems.delete(itemId);
      } else {
        newCollapsedItems.add(itemId);
      }
      return { collapsedItems: newCollapsedItems };
    });
  },

  setShowSidebar: show => {
    if (get().showSidebar !== show) {
      set({ showSidebar: show });
    }
  },

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
