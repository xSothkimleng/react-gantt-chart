import { create } from 'zustand';
import { Column } from '../types/column';
import { Row } from '../types/row';
import { TimeFrameSettingType } from '../types/timeFrameSettingType';
import { timeFrameSetting } from '../constants/timeFrameSetting';
import { DateRangeType } from '../types/dateRangeType';
import { updateNestedRowById } from '../utils/rowUtils';

type GanttChartStore = {
  // state
  isLoading: boolean;
  columns: Column;
  rows: Row[];
  chartTimeFrameView: TimeFrameSettingType;
  showSidebar: boolean;
  collapsedItems: Set<string>;
  ButtonContainer?: React.FC;
  externalGetSelectedRow?: (row: Row) => void;
  chartDateRange: DateRangeType;
  isChartBorderReached: boolean;
  zoomWidth: number;

  // actions
  setIsLoading: (loading: boolean) => void;
  setColumn: (column: Column) => void;
  setRow: (row: Row[]) => void;
  updateRow: (rowId: string | number, updateFn: (row: Row) => Row) => void;
  setChartTimeFrameView: (view: TimeFrameSettingType) => void;
  setShowSidebar: (showSidebar: boolean) => void;
  toggleCollapse: (itemId: string) => void;
  setButtonContainer: (component: React.FC | undefined) => void;
  setExternalGetSelectedRow: (fn: ((row: Row) => void) | undefined) => void;
  setChartDateRange: (dateRange: DateRangeType) => void;
  setIsChartBorderReached: (isReached: boolean) => void;
  zoomIn: () => void;
  zoomOut: () => void;
};

export const useGanttChartStore = create<GanttChartStore>((set, get) => ({
  // state
  isLoading: false,
  columns: {} as Column,
  rows: [],
  chartTimeFrameView: timeFrameSetting.monthly,
  showSidebar: true,
  collapsedItems: new Set<string>(),
  ButtonContainer: undefined,
  externalGetSelectedRow: undefined,
  chartDateRange: [],
  isChartBorderReached: false,
  zoomWidth: 0,

  // actions
  setIsLoading: loading => set({ isLoading: loading }),
  setColumn: columns => set({ columns }),
  setRow: rows => set({ rows }),
  updateRow: (rowId, updateFn) =>
    set(state => ({
      rows: updateNestedRowById(state.rows, rowId, updateFn),
    })),
  setChartTimeFrameView: view => set({ chartTimeFrameView: view }),
  setShowSidebar: showSidebar => set({ showSidebar }),
  setButtonContainer: component => set({ ButtonContainer: component }),
  setExternalGetSelectedRow: fn => set({ externalGetSelectedRow: fn }),
  setIsChartBorderReached: isReached => set({ isChartBorderReached: isReached }),
  zoomIn: () => set(state => ({ zoomWidth: state.zoomWidth + 10 })),
  zoomOut: () =>
    set(state => {
      const newZoomWidth = state.zoomWidth - 10;
      return { zoomWidth: newZoomWidth < 0 ? 0 : newZoomWidth };
    }),
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
  setChartDateRange: dateRange => {
    // Only update if truly changed (shallow comparison should be sufficient for most cases)
    if (get().chartDateRange !== dateRange) {
      set({ chartDateRange: dateRange });
    }
  },
}));
