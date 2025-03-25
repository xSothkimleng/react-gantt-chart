// src/stores/useConfigStore.ts
import { create } from 'zustand';
import { timeFrameSetting } from '../constants/timeFrameSetting';
import { TimeFrameSettingType } from '../types/timeFrameSettingType';
import { Column } from '../types/column';

interface ConfigState {
  // Core chart configuration
  chartTimeFrameView: TimeFrameSettingType;
  columnSetting: Column | undefined;
  zoomWidth: number;

  // Configuration actions
  setChartTimeFrameView: (view: TimeFrameSettingType) => void;
  setColumnSetting: (columns: Column | undefined) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export const useConfigStore = create<ConfigState>(set => ({
  chartTimeFrameView: timeFrameSetting.monthly,
  columnSetting: undefined,
  zoomWidth: 0,

  setChartTimeFrameView: view => set({ chartTimeFrameView: view }),
  setColumnSetting: columns => set({ columnSetting: columns }),

  zoomIn: () => set(state => ({ zoomWidth: state.zoomWidth + 10 })),
  zoomOut: () =>
    set(state => {
      const newZoomWidth = state.zoomWidth - 10;
      return { zoomWidth: newZoomWidth < 0 ? 0 : newZoomWidth };
    }),
}));
