// src/stores/useConfigStore.ts
import { create } from 'zustand';
import { TimeFrameSettingType } from '../types/timeFrameSettingType';
import { DateRangeType } from '../types/dateRangeType';
import { timeFrameSetting } from '../constants/timeFrameSetting';

interface ConfigState {
  chartTimeFrameView: TimeFrameSettingType;
  chartDateRange: DateRangeType;
  zoomWidth: number;

  setChartTimeFrameView: (view: TimeFrameSettingType) => void;
  setChartDateRange: (range: DateRangeType) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export const useConfigStore = create<ConfigState>(set => ({
  chartTimeFrameView: timeFrameSetting.monthly,
  chartDateRange: [],
  zoomWidth: 0,

  setChartTimeFrameView: view => set({ chartTimeFrameView: view }),
  setChartDateRange: range => set({ chartDateRange: range }),
  zoomIn: () => set(state => ({ zoomWidth: state.zoomWidth + 10 })),
  zoomOut: () =>
    set(state => {
      const newZoomWidth = state.zoomWidth - 10;
      if (newZoomWidth < 0) return state;
      return { zoomWidth: newZoomWidth };
    }),
}));
