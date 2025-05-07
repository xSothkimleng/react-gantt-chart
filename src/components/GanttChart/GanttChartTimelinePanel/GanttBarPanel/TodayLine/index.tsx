import React, { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useConfigStore } from '../../../../../stores/useConfigStore';
import { calculateGanttBarPositionFromInitialStartingPoint } from '../../../../../utils/ganttBarUtils';

const TodayLine = () => {
  // Get necessary data from the config store
  const { chartDateRange, chartTimeFrameView, zoomWidth } = useConfigStore(
    useShallow(state => ({
      chartDateRange: state.chartDateRange,
      chartTimeFrameView: state.chartTimeFrameView,
      zoomWidth: state.zoomWidth,
    })),
  );

  // Calculate day width (same as in GanttBarPanel)
  const dayWidth = useMemo(() => {
    return chartTimeFrameView.dayWidthUnit + zoomWidth;
  }, [chartTimeFrameView.dayWidthUnit, zoomWidth]);

  // Skip rendering if chart date range is empty
  if (!chartDateRange || chartDateRange.length === 0) {
    return null;
  }

  // Get today's date
  const today = new Date();

  // Get the first date from chart date range
  const firstDate = chartDateRange[0];

  // Calculate position in days from the start
  const dayPosition = calculateGanttBarPositionFromInitialStartingPoint(today, firstDate);

  // Calculate the actual pixel position
  const todayPosition = dayPosition * dayWidth;

  // Style for the today line
  const todayLineStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: `${todayPosition - 1}px`,
    width: '2px',
    height: '100%',
    backgroundColor: '#3CB371',
    zIndex: 98,
  };

  return (
    <div className='gantt-today-line' style={todayLineStyle} title={`Today: ${today.toLocaleDateString()}`}>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            backgroundColor: '#3CB371',
            zIndex: 97,
          }}>
          <p
            style={{
              fontSize: '0.5rem',
              fontWeight: '600',
              letterSpacing: '1.5px',
              margin: '0',
              padding: '0 3px',
              color: 'white',
            }}>
            Today
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TodayLine);
