import { memo, useEffect, useMemo } from 'react';
import GanttChartLoading from '../../../Loading';
import { useGanttChartStore } from '../../../../stores/useGanttChartStore';
import { getTotalDayInChartDateRange } from '../../../../utils/ganttBarUtils';
import { useInteractionStore } from '../../../../stores/useInteractionStore';
import GanttBarPanelRowTree from './RowTree';
import './styles.css';

const GanttBarPanel = () => {
  const isLoading = useGanttChartStore(state => state.isLoading);
  const chartDateRange = useGanttChartStore(state => state.chartDateRange);
  const chartTimeFrameView = useGanttChartStore(state => state.chartTimeFrameView);
  const zoomWidth = useGanttChartStore(state => state.zoomWidth);
  const setBoundaries = useInteractionStore(state => state.setBoundaries);

  const dayWidth = useMemo(() => {
    return chartTimeFrameView.dayWidthUnit + zoomWidth;
  }, [chartTimeFrameView.dayWidthUnit, zoomWidth]);

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

  if (isLoading || chartDateRange.length === 0) {
    return (
      <div style={{ background: 'rgba(0,0,0,0.2)', width: '100%', height: '100%' }}>
        <GanttChartLoading />
      </div>
    );
  }

  return (
    <div
      className='gantt-bar-panel'
      style={{
        background: `repeating-linear-gradient(
          to right,
          transparent,
          transparent ${dayWidth - 1}px,
          rgba(0,0,0,0.05) ${dayWidth - 1}px,
          rgba(0,0,0,0.05) ${dayWidth}px
        )`,
      }}>
      <GanttBarPanelRowTree />
    </div>
  );
};

export default memo(GanttBarPanel);
