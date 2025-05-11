import React, { useEffect, useMemo } from 'react';
import GanttChartLoading from '../../../Loading';
import { useConfigStore } from '../../../../stores/useConfigStore';
import { getTotalDayInChartDateRange } from '../../../../utils/ganttBarUtils';
import { useInteractionStore } from '../../../../stores/useInteractionStore';
import GanttBarPanelRowTree from './RowTree';
import { useShallow } from 'zustand/shallow';
import './styles.css';
import TodayLine from './TodayLine';

const GanttBarPanel = () => {
  // Get only what we need from the stores with useShallow
  const { isLoading, chartDateRange, chartTimeFrameView, zoomWidth } = useConfigStore(
    useShallow(state => ({
      isLoading: state.isLoading,
      chartDateRange: state.chartDateRange,
      chartTimeFrameView: state.chartTimeFrameView,
      zoomWidth: state.zoomWidth,
    })),
  );

  const setBoundaries = useInteractionStore(state => state.setBoundaries);

  // Memoize dayWidth calculation
  const dayWidth = useMemo(() => {
    return chartTimeFrameView.dayWidthUnit + zoomWidth;
  }, [chartTimeFrameView.dayWidthUnit, zoomWidth]);

  // Memoize boundaries calculation
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

  // Create a memoized background style for the grid
  const backgroundStyle: React.CSSProperties = useMemo(() => {
    return {
      background: `repeating-linear-gradient(
          to right,
          transparent,
          transparent ${dayWidth - 1}px,
          rgba(0,0,0,0.05) ${dayWidth - 1}px,
          rgba(0,0,0,0.05) ${dayWidth}px
        )`,
      position: 'relative',
      width: '100%',
      height: '1000%',
      // overflow: 'hidden',
    };
  }, [dayWidth]);

  // Update boundaries in the store when they change - NOT during render
  useEffect(() => {
    // Only update boundaries if they are valid
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
    <div className='gantt-bar-panel' style={backgroundStyle}>
      <GanttBarPanelRowTree />
      <TodayLine />
    </div>
  );
};

export default React.memo(GanttBarPanel);
