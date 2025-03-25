// src/provider/GanttChartProvider.tsx (simplified version)
import React, { useEffect, useRef, ReactNode } from 'react';
import { GanttChartContext } from '../context/GanttChartContext';
import { TimeFrameSettingType } from '../types/timeFrameSettingType';
import { Column } from '../types/column';
import { Row } from '../types/row';
import { useConfigStore, useRowsStore } from '../stores';
import { registerZoomFunctions } from '../utils/zoomFunctions';

interface GanttChartProviderProps {
  children: ReactNode;
  row: Row[];
  column?: Column;
  defaultView?: TimeFrameSettingType;
  ButtonContainer?: React.FC;
  getSelectedRow?: (row: Row) => void;
}

export const GanttChartProvider: React.FC<GanttChartProviderProps> = ({
  row,
  column,
  children,
  getSelectedRow,
  defaultView,
  ButtonContainer,
}) => {
  // Get functions from stores
  const { setChartTimeFrameView, zoomIn, zoomOut } = useConfigStore();
  const { setRows } = useRowsStore();

  // Create refs for timeline panel and boundaries
  const timelinePanelRef = useRef<HTMLDivElement | null>(null);
  const leftBoundary = useRef<number>(0);
  const rightBoundary = useRef<number>(0);
  const isChartBorderReached = useRef<boolean>(false);
  const previousContainerScrollLeftPosition = useRef<number>(0);

  // Initialize the data
  useEffect(() => {
    // Set the initial rows
    setRows(row);

    // Set the default view if provided
    if (defaultView) {
      setChartTimeFrameView(defaultView);
    }

    // Register zoom functions
    registerZoomFunctions(zoomIn, zoomOut);
  }, [row, defaultView, setRows, setChartTimeFrameView, zoomIn, zoomOut]);

  // No need to create a complex context value anymore
  // We just pass the minimal props needed for compatibility
  const contextValue = {
    timelinePanelRef,
    leftBoundary,
    rightBoundary,
    isChartBorderReached,
    previousContainerScrollLeftPosition,
    getSelectedRow,
    ButtonContainer,
    columnSetting: column,
  };

  return <GanttChartContext.Provider value={contextValue}>{children}</GanttChartContext.Provider>;
};
