'use client';
import React, { useEffect } from 'react';
import { GanttChartProvider } from '../../provider/GanttChartProvider';
import { timeFrameSetting } from '../../constants/timeFrameSetting';
import { TimeFrameSettingType } from '../../types/timeFrameSettingType';
import { Column } from '../../types/column';
import { Row } from '../../types/row';
import GanttChartContent from './GanttChartContent';
import { useConfigStore, useRowsStore } from '../../stores';

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
  const { setChartTimeFrameView } = useConfigStore();
  const { setRows } = useRowsStore();

  useEffect(() => {
    // Set initial view
    setChartTimeFrameView(defaultView);

    // Set initial rows
    setRows(rows);
  }, [defaultView, rows, setChartTimeFrameView, setRows]);

  return (
    <GanttChartProvider
      defaultView={defaultView}
      row={rows}
      column={columns}
      getSelectedRow={getSelectedRow}
      ButtonContainer={ButtonContainer}>
      <GanttChartContent showSidebar={showSidebar} className={className} columnSetting={columns} />
    </GanttChartProvider>
  );
};

export default GanttChart;
