'use client';
import React from 'react';
import { GanttChartProvider } from '../../provider/GanttChartProvider';
import { timeFrameSetting } from '../../constants/timeFrameSetting';
import { TimeFrameSettingType } from '../../types/timeFrameSettingType';
import { Column } from '../../types/column';
import { Row } from '../../types/row';
import GanttChartContent from './GanttChartContent';

export interface GanttChartProps {
  rows: Row[];
  columns?: Column;
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
  return (
    <GanttChartProvider
      defaultView={defaultView}
      row={rows}
      column={columns}
      getSelectedRow={getSelectedRow}
      ButtonContainer={ButtonContainer}>
      <GanttChartContent showSidebar={showSidebar} className={className} />
    </GanttChartProvider>
  );
};

export default GanttChart;
