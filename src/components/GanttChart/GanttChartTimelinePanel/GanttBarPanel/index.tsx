// src/components/GanttChart/GanttChartTimelinePanel/GanttBarPanel/index.tsx
import React, { useEffect, useMemo } from 'react';
import GanttChartLoading from '../../../Loading/spinner';
import { useGanttChartStore } from '../../../../stores/GanttChartStore';
import { getTotalDayInChartDateRange } from '../../../../utils/ganttBarUtils';
import { useInteractionStore } from '../../../../stores/useInteractionStore';
import GanttBarRowsRender from './GanttBarRowsRender';

const GanttBarPanel = () => {
  // Use selector functions that return primitives when possible
  const isLoading = useGanttChartStore(state => state.isLoading);
  const chartDateRange = useGanttChartStore(state => state.chartDateRange);
  const dayWidthUnit = useGanttChartStore(state => state.chartTimeFrameView.dayWidthUnit);
  const zoomWidth = useGanttChartStore(state => state.zoomWidth);
  const setBoundaries = useInteractionStore(state => state.setBoundaries);

  // Important: Create a stable selector for IDs - this must be memoized!
  const rowIds = useGanttChartStore(state =>
    // Using JSON.stringify creates a stable identity for the array
    JSON.stringify(state.rows.map(row => row.id)),
  );
  // Parse the stringified IDs back to an array
  const parsedRowIds = useMemo(() => JSON.parse(rowIds), [rowIds]);

  // Get collapsed items as an array instead of a Set to avoid reference issues
  const collapsedItemsArray = useGanttChartStore(state => Array.from(state.collapsedItems));

  // Create the collapsed items Set from the array
  const collapsedItems = useMemo(() => new Set(collapsedItemsArray), [collapsedItemsArray]);

  // Calculate day width once per render
  const dayWidth = useMemo(() => {
    return dayWidthUnit + zoomWidth;
  }, [dayWidthUnit, zoomWidth]);

  // Calculate boundaries
  const boundaries = useMemo(() => {
    if (!chartDateRange || chartDateRange.length === 0) {
      return { left: 0, right: 0 };
    }

    const leftBoundary = dayWidth * 7;
    const totalDays = getTotalDayInChartDateRange(chartDateRange);
    const rightBoundary = totalDays * dayWidth - dayWidth * 7;
    const finalRightBoundary = rightBoundary <= leftBoundary ? leftBoundary + 100 : rightBoundary;

    return { left: leftBoundary, right: finalRightBoundary };
  }, [chartDateRange, dayWidth]);

  // Update boundaries in the store
  useEffect(() => {
    if (boundaries.left >= 0 && boundaries.right > boundaries.left) {
      setBoundaries(boundaries.left, boundaries.right);
    }
  }, [boundaries.left, boundaries.right, setBoundaries]);

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
      <GanttBarRowsRender rowIds={parsedRowIds} collapsedItems={collapsedItems} />
    </div>
  );
};

export default React.memo(GanttBarPanel);
