import React, { useEffect, useMemo } from 'react';
import GanttBar from './GanttBar';
import GanttChartLoading from '../../../Loading/spinner';
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

  // Only calculate day width once per render
  const dayWidth = useMemo(() => {
    return chartTimeFrameView.dayWidthUnit + zoomWidth;
  }, [chartTimeFrameView.dayWidthUnit, zoomWidth]);

  // Calculate boundaries in a safe memoized way
  const boundaries = useMemo(() => {
    // Skip calculation if chart date range is empty
    if (!chartDateRange || chartDateRange.length === 0) {
      return { left: 0, right: 0 };
    }

    // Left boundary is a fixed offset from the start
    const leftBoundary = dayWidth * 7;

    // Right boundary is based on the total days in the chart
    const totalDays = getTotalDayInChartDateRange(chartDateRange);
    const rightBoundary = totalDays * dayWidth - dayWidth * 7;

    // Ensure a minimum chart width even at small zoom levels
    const finalRightBoundary = rightBoundary <= leftBoundary ? leftBoundary + 100 : rightBoundary;

    return { left: leftBoundary, right: finalRightBoundary };
  }, [chartDateRange, dayWidth]);

  // Update boundaries in the store when they change - NOT during render
  useEffect(() => {
    // Only update boundaries if they are valid
    if (boundaries.left >= 0 && boundaries.right > boundaries.left) {
      setBoundaries(boundaries.left, boundaries.right);
    }
  }, [boundaries.left, boundaries.right, setBoundaries]);

  // Row rendering logic with memoization to prevent unnecessary re-renders
  const renderedRows = useMemo(() => {
    // Don't try to render if we don't have valid rows or the chart date range isn't ready
    if (rows.length === 0 || chartDateRange.length === 0) {
      return null;
    }

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
  }, [rows, collapsedItems, chartDateRange.length]);

  // Loading state - also check if chartDateRange is ready
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
