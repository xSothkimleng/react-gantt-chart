import GanttBar from './GanttBar';
import GanttChartLoading from '../../../Loading';
import { Row } from '../../../../types/row';
import { useGanttChartStore } from '../../../../stores/GanttChartStore';
import { useEffect } from 'react';
import { getTotalDayInChartDateRange } from '../../../../utils/ganttBarUtils';
import { useInteractionStore } from '../../../../stores/useInteractionStore';

const GanttBarPanel = () => {
  const isLoading = useGanttChartStore(state => state.isLoading);
  const rows = useGanttChartStore(state => state.rows);
  const collapsedItems = useGanttChartStore(state => state.collapsedItems);
  const chartDateRange = useGanttChartStore(state => state.chartDateRange);
  const chartTimeFrameView = useGanttChartStore(state => state.chartTimeFrameView);
  const zoomWidth = useGanttChartStore(state => state.zoomWidth);
  // const { chartTimeFrameView, zoomWidth } = useConfigStore(state => ({
  //   chartTimeFrameView: state.chartTimeFrameView,
  //   zoomWidth: state.zoomWidth,
  // }));

  // const { isLoading, chartDateRange, collapsedItems } = useUIStore(state => ({
  //   isLoading: state.isLoading,
  //   chartDateRange: state.chartDateRange,
  //   collapsedItems: state.collapsedItems,
  // }));

  // const { allRows } = useRowsStore(state => ({ allRows: state.allRows }));

  // const { setBoundaries } = useInteractionStore(state => ({
  //   leftBoundary: state.leftBoundary,
  //   rightBoundary: state.rightBoundary,
  //   setBoundaries: state.setBoundaries,
  // }));

  // let currentIndex = 0;

  // Calculate the total days in the chart date range

  // useEffect(() => {
  //   // Recalculate boundaries whenever chartDateRange or chartTimeFrameView changes
  //   if (chartDateRange.length > 0) {
  //     // combine default width with zoom width
  //     const chartWidth = chartTimeFrameView.dayWidthUnit + zoomWidth;

  //     // Left boundary is a fixed offset from the start
  //     const newLeftBoundary = chartWidth * 7;

  //     // Right boundary is based on the total days in the chart
  //     const totalDays = getTotalDayInChartDateRange(chartDateRange);
  //     const newRightBoundary = totalDays * chartWidth - chartWidth * 7;

  //     // Ensure a minimum chart width even at small zoom levels
  //     const finalRightBoundary = newRightBoundary <= newLeftBoundary ? newLeftBoundary + 100 : newRightBoundary;

  //     setBoundaries(newLeftBoundary, finalRightBoundary);
  //   }
  // }, [chartDateRange, chartTimeFrameView, zoomWidth, setBoundaries]);

  // Calculate and update boundaries whenever the chart date range changes
  useEffect(() => {
    // Recalculate boundaries whenever chartDateRange or chartTimeFrameView changes
    if (chartDateRange.length > 0) {
      // combine default width with zoom width
      const chartWidth = chartTimeFrameView.dayWidthUnit + zoomWidth;

      // Left boundary is a fixed offset from the start
      const newLeftBoundary = chartWidth * 7;

      // Right boundary is based on the total days in the chart
      const totalDays = getTotalDayInChartDateRange(chartDateRange);
      const newRightBoundary = totalDays * chartWidth - chartWidth * 7;

      // Ensure a minimum chart width even at small zoom levels
      const finalRightBoundary = newRightBoundary <= newLeftBoundary ? newLeftBoundary + 100 : newRightBoundary;

      // Set boundaries in the interaction store
      const { setBoundaries } = useInteractionStore.getState();
      setBoundaries(newLeftBoundary, finalRightBoundary);
    }
  }, [chartDateRange, chartTimeFrameView, zoomWidth]);

  let currentIndex = 0;

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
      {rows.map(row => renderRow(row))}
    </div>
  );
};

export default GanttBarPanel;
