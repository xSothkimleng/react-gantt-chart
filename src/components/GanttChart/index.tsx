'use client';
import React, { useEffect, useRef } from 'react';
import { timeFrameSetting } from '../../constants/timeFrameSetting';
import { TimeFrameSettingType } from '../../types/timeFrameSettingType';
import { Column } from '../../types/column';
import { Row } from '../../types/row';
import GanttChartContent from './GanttChartContent';
import { initializeStores } from '../../utils/initializeStores';
import { useGanttInteractions } from '../../hooks/useGanttInteractions';
import { useConfigStore } from '../../stores/useConfigStore';
import { useUIStore } from '../../stores/useUIStore';

export interface GanttChartProps {
  rows: Row[];
  columns: Column;
  showSidebar?: boolean;
  defaultView?: TimeFrameSettingType;
  ButtonContainer?: React.FC;
  getSelectedRow?: (row: Row) => void;
  className?: string;
}

const GanttChart: React.FC<GanttChartProps> = ({
  columns,
  rows,
  ButtonContainer,
  getSelectedRow,
  showSidebar = true,
  defaultView = timeFrameSetting.monthly,
  className = '',
}) => {
  // Use the config store for sidebar and chart view
  const setShowSidebar = useConfigStore(state => state.setShowSidebar);
  const setChartTimeFrameView = useConfigStore(state => state.setChartTimeFrameView);

  // Use the UI store for external handlers
  const setButtonContainer = useUIStore(state => state.setButtonContainer);
  const setExternalGetSelectedRow = useUIStore(state => state.setExternalGetSelectedRow);

  // Track whether we've initialized stores to prevent multiple initializations
  const isInitialized = useRef(false);

  // Move store initialization to an effect to avoid state updates during render
  useEffect(() => {
    if (!isInitialized.current) {
      // Initialize stores only once
      initializeStores({
        rows,
        columns,
        getSelectedRow,
        ButtonContainer,
      });
      isInitialized.current = true;
    }
  }, [rows, columns, getSelectedRow, ButtonContainer]);

  useEffect(() => {
    setButtonContainer(ButtonContainer);
    setExternalGetSelectedRow(getSelectedRow);
  }, [ButtonContainer, getSelectedRow, setButtonContainer, setExternalGetSelectedRow]);

  useEffect(() => {
    setShowSidebar(showSidebar);
  }, [showSidebar, setShowSidebar]);

  useEffect(() => {
    setChartTimeFrameView(defaultView);
  }, [defaultView, setChartTimeFrameView]);

  useGanttInteractions();

  useEffect(() => {
    console.log('Current Rows :', rows);
  }, [rows]);

  return <GanttChartContent className={className} />;
};

export default GanttChart;
