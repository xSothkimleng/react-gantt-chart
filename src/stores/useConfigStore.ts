import { create } from 'zustand';
import { Column } from '../types/column';
import { TimeFrameSettingType } from '../types/timeFrameSettingType';
import { DateRangeType } from '../types/dateRangeType';
import { timeFrameSetting } from '../constants/timeFrameSetting';

type ConfigState = {
  // State
  columns: Column;
  chartTimeFrameView: TimeFrameSettingType;
  showSidebar: boolean;
  chartDateRange: DateRangeType;
  zoomWidth: number;
  isLoading: boolean;

  // Actions
  setColumns: (columns: Column) => void;
  setChartTimeFrameView: (view: TimeFrameSettingType) => void;
  setShowSidebar: (show: boolean) => void;
  setChartDateRange: (dateRange: DateRangeType) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setIsLoading: (loading: boolean) => void;

  // Computed values
  getDayWidth: () => number;
};

export const useConfigStore = create<ConfigState>((set, get) => ({
  // State
  columns: {} as Column,
  chartTimeFrameView: timeFrameSetting.monthly,
  showSidebar: true,
  chartDateRange: [],
  zoomWidth: 0,
  isLoading: false,

  // Actions
  setColumns: columns => set({ columns }),
  setChartTimeFrameView: view => set({ chartTimeFrameView: view }),
  setShowSidebar: show => set({ showSidebar: show }),
  setChartDateRange: dateRange => set({ chartDateRange: dateRange }),
  zoomIn: () => set(state => ({ zoomWidth: state.zoomWidth + 10 })),
  zoomOut: () =>
    set(state => {
      const newZoomWidth = state.zoomWidth - 10;
      return { zoomWidth: newZoomWidth < 0 ? 0 : newZoomWidth };
    }),
  setIsLoading: loading => set({ isLoading: loading }),

  // Computed values
  getDayWidth: () => {
    const { chartTimeFrameView, zoomWidth } = get();
    return chartTimeFrameView.dayWidthUnit + zoomWidth;
  },
}));
