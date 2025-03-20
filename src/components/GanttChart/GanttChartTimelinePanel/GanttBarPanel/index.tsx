import { useEffect } from 'react';
import { useGanttChart } from '../../../../context/GanttChartContext';
import GanttBar from './GanttBar';
import GanttChartLoading from '../../../Loading';
import { Row } from '../../../../types/row';
import { getTotalDayInChartDateRange } from '../../../../utils/ganttBarUtils';

const GanttBarPanel = () => {
  const { isLoading, allRow, chartTimeFrameView, chartDateRange, collapsedItems, leftBoundary, rightBoundary, zoomWidth } =
    useGanttChart();
  let currentIndex = 0;

  useEffect(() => {
    // Recalculate boundaries whenever chartDateRange or chartTimeFrameView changes
    if (chartDateRange.length > 0) {
      // combine default width with zoom width
      const chartWidth = chartTimeFrameView.dayWidthUnit + zoomWidth;

      // Left boundary is a fixed offset from the start
      leftBoundary.current = chartWidth * 7;

      // Right boundary is based on the total days in the chart
      const totalDays = getTotalDayInChartDateRange(chartDateRange);
      rightBoundary.current = totalDays * chartWidth - chartWidth * 7;

      // Ensure a minimum chart width even at small zoom levels
      if (rightBoundary.current <= leftBoundary.current) {
        rightBoundary.current = leftBoundary.current + 100;
      }
    }
  }, [chartDateRange, chartTimeFrameView]);

  const renderRow = (row: Row) => {
    const RowIndex = currentIndex++;
    const isCollapsed = collapsedItems.has(row.id.toString());

    return (
      <div key={RowIndex}>
        <GanttBar index={RowIndex} row={row} />
        {row.children && !isCollapsed && row.children.map(childRow => renderRow(childRow))}
      </div>
    );
  };

  if (isLoading || chartDateRange.length === 0) {
    return (
      <div style={{ background: 'rgba(0,0,0,0.2)', width: '100%', height: '100%' }}>
        <GanttChartLoading />
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderTop: '1px solid lightgray',
        borderRight: '1px solid lightgray',
        boxSizing: 'border-box',
        overflowY: 'auto',
        background: `repeating-linear-gradient(
          to right,
          transparent,
          transparent ${chartTimeFrameView.dayWidthUnit + zoomWidth - 1}px,
          rgba(0,0,0,0.05) ${chartTimeFrameView.dayWidthUnit + zoomWidth - 1}px,
          rgba(0,0,0,0.05) ${chartTimeFrameView.dayWidthUnit + zoomWidth}px
        )`,
      }}>
      {allRow.map(row => renderRow(row))}
    </div>
  );
};

export default GanttBarPanel;
