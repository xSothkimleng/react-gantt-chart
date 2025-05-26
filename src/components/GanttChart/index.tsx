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

type customRowType = {
  rowHeight: number;
  component: React.FC<{ row: Row; isCompactView: boolean }>;
  collapsedIconColor?: string;
  collapsedBackgroundColor?: string;
};
export interface GanttChartProps {
  rows: Row[];
  columns: Column;
  showSidebar?: boolean;
  defaultView?: TimeFrameSettingType;
  ButtonContainer?: React.FC;
  getSelectedRow?: (row: Row) => void;
  className?: string;
  height?: string | number;
  width?: string | number;
  customRow?: customRowType;
  isCompactView?: boolean;
}

const GanttChart: React.FC<GanttChartProps> = ({
  columns,
  rows,
  ButtonContainer,
  getSelectedRow,
  showSidebar = true,
  defaultView = timeFrameSetting.monthly,
  className = '',
  height,
  width,
  customRow,
  isCompactView = false,
}) => {
  // Store actions
  const setRows = useRowsStore(state => state.setRows);
  const setShowSidebar = useConfigStore(state => state.setShowSidebar);
  const setIsCompactView = useConfigStore(state => state.setIsCompactView);
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
      rowCustomComponent: customRow?.component,
      rowHeight: customRow?.rowHeight ?? 40,
      collapsedIconColor: customRow?.collapsedIconColor,
      collapsedBackgroundColor: customRow?.collapsedBackgroundColor,
    });
  }, []);

  // Update rows whenever they change
  useEffect(() => {
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
    setIsCompactView(isCompactView);
  }, [isCompactView, setIsCompactView]);

  useEffect(() => {
    setChartTimeFrameView(defaultView);
  }, [defaultView, setChartTimeFrameView]);

  useGanttInteractions();

  return <GanttChartContent className={className} height={height} width={width} />;
};

export default GanttChart;
