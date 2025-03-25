import React, { useEffect, useMemo } from 'react';
import GanttBar from './GanttBar';
import GanttChartLoading from '../../../Loading';
import { Row } from '../../../../types/row';
import { useGanttChartStore } from '../../../../stores/GanttChartStore';
import { getTotalDayInChartDateRange } from '../../../../utils/ganttBarUtils';
import { useInteractionStore } from '../../../../stores/useInteractionStore';

const GanttBarPanel = () => {
  const isLoading = useGanttChartStore(state => state.isLoading);
  const rows = useGanttChartStore(state => state.rows);
  const collapsedItems = useGanttChartStore(state => state.collapsedItems);
  const chartDateRange = useGanttChartStore(state => state.chartDateRange);
  const chartTimeFrameView = useGanttChartStore(state => state.chartTimeFrameView);
  const zoomWidth = useGanttChartStore(state => state.zoomWidth);
  const setBoundaries = useInteractionStore(state => state.setBoundaries);

  // Calculate boundaries in a memoized way to prevent recalculations on every render
  const boundaries = useMemo(() => {
    if (chartDateRange.length === 0) return { left: 0, right: 0 };

    // combine default width with zoom width
    const chartWidth = chartTimeFrameView.dayWidthUnit + zoomWidth;

    // Left boundary is a fixed offset from the start
    const leftBoundary = chartWidth * 7;

    // Right boundary is based on the total days in the chart
    const totalDays = getTotalDayInChartDateRange(chartDateRange);
    const rightBoundary = totalDays * chartWidth - chartWidth * 7;

    // Ensure a minimum chart width even at small zoom levels
    const finalRightBoundary = rightBoundary <= leftBoundary ? leftBoundary + 100 : rightBoundary;

    return { left: leftBoundary, right: finalRightBoundary };
  }, [chartDateRange, chartTimeFrameView, zoomWidth]);

  // Update boundaries in the store when they change
  useEffect(() => {
    setBoundaries(boundaries.left, boundaries.right);
  }, [boundaries.left, boundaries.right, setBoundaries]);

  // Row rendering logic with memoization to prevent unnecessary re-renders
  const renderedRows = useMemo(() => {
    let currentIndex = 0;

    const renderRow = (row: Row) => {
      const rowIndex = currentIndex++;
      const isCollapsed = collapsedItems.has(row.id.toString());

      return (
        <div key={row.id.toString()}>
          <GanttBar index={rowIndex} row={row} />
          {row.children && !isCollapsed && row.children.map(childRow => renderRow(childRow))}
        </div>
      );
    };

    return rows.map(row => renderRow(row));
  }, [rows, collapsedItems]);

  if (isLoading || chartDateRange.length === 0) {
    return (
      <div style={{ background: 'rgba(0,0,0,0.2)', width: '100%', height: '100%' }}>
        <GanttChartLoading />
      </div>
    );
  }

  const dayWidth = chartTimeFrameView.dayWidthUnit + zoomWidth;

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
          transparent ${dayWidth - 1}px,
          rgba(0,0,0,0.05) ${dayWidth - 1}px,
          rgba(0,0,0,0.05) ${dayWidth}px
        )`,
      }}>
      {renderedRows}
    </div>
  );
};

export default React.memo(GanttBarPanel);
