'use client';
import React, { useEffect } from 'react';
import { timeFrameSetting } from '../../constants/timeFrameSetting';
import { TimeFrameSettingType } from '../../types/timeFrameSettingType';
import { Column } from '../../types/column';
import { Row } from '../../types/row';
import GanttChartContent from './GanttChartContent';
import { initializeStores } from '../../utils/initializeStores';
import { useGanttInteractions } from '../../hooks/useGanttInteractions';
import { useConfigStore } from '../../stores/useConfigStore';
import { useUIStore } from '../../stores/useUIStore';
import { useRowsStore } from '../../stores/useRowsStore';

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
  // Store actions
  const setRows = useRowsStore(state => state.setRows);
  const setShowSidebar = useConfigStore(state => state.setShowSidebar);
  const setChartTimeFrameView = useConfigStore(state => state.setChartTimeFrameView);
  const setButtonContainer = useUIStore(state => state.setButtonContainer);
  const setExternalGetSelectedRow = useUIStore(state => state.setExternalGetSelectedRow);
  const setColumns = useConfigStore(state => state.setColumns);

  // Initialize stores on first render only
  useEffect(() => {
    initializeStores({
      columns: columns || ({} as Column),
      getSelectedRow,
      ButtonContainer,
    });
  }, []);

  // Update rows whenever they change
  useEffect(() => {
    console.log('Rows updated:', rows);
    if (rows) {
      setRows(rows);
    }
  }, [rows, setRows]);

  // Update columns when they change
  useEffect(() => {
    setColumns(columns || ({} as Column));
  }, [columns, setColumns]);

  // Update UI-related props
  useEffect(() => {
    setButtonContainer(ButtonContainer);
    setExternalGetSelectedRow(getSelectedRow);
  }, [ButtonContainer, getSelectedRow, setButtonContainer, setExternalGetSelectedRow]);

  // Update config settings
  useEffect(() => {
    setShowSidebar(showSidebar);
  }, [showSidebar, setShowSidebar]);

  useEffect(() => {
    setChartTimeFrameView(defaultView);
  }, [defaultView, setChartTimeFrameView]);

  // Set up interactions
  useGanttInteractions();

  return <GanttChartContent className={className} />;
};

export default GanttChart;
