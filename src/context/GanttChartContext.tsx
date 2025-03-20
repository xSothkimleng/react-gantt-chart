// src/context/useGanttChart.ts
import { createContext, useContext } from 'react';
import { GanttChartContextType } from '../types/ganttChartContextType';

export const GanttChartContext = createContext<GanttChartContextType | undefined>(undefined);

export const useGanttChart = (): GanttChartContextType => {
  const context = useContext(GanttChartContext);
  if (!context) {
    throw new Error('useGanttChart must be used within a GanttChartProvider');
  }
  return context;
};
