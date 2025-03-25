'use client';
import React from 'react';
import { timeFrameSetting } from '../../constants/timeFrameSetting';
import { TimeFrameSettingType } from '../../types/timeFrameSettingType';
import { Column } from '../../types/column';
import { Row } from '../../types/row';
import GanttChartContent from './GanttChartContent';
import { initializeStores } from '../../utils/initializeStores';

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
  // Initialize stores
  initializeStores({
    rows,
    columns,
    defaultView,
    getSelectedRow,
    ButtonContainer,
    showSidebar,
  });

  // Initialize interaction handlers
  // useGanttInteractions();

  return <GanttChartContent className={className} />;
};

export default GanttChart;
