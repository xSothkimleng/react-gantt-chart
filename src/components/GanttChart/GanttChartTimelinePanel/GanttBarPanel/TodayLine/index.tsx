import React, { useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useConfigStore } from '../../../../../stores/useConfigStore';
import { calculateGanttBarPositionFromInitialStartingPoint } from '../../../../../utils/ganttBarUtils';

type TodayLineProps = {
  panelHeight?: string | number;
};

const TodayLine: React.FC<TodayLineProps> = ({ panelHeight }) => {
  // Get necessary data from the config store
  const [isHover, setIsHover] = useState(false);
  const isCompactView = useConfigStore(state => state.isCompactView);

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
    top: isCompactView ? 24 : 48,
    left: `${todayPosition - 1}px`,
    width: dayWidth,
    height: panelHeight ? panelHeight : '100%',
    backgroundColor: 'rgba(0, 184, 169, 0.1)',
    zIndex: 10,
  };

  return (
    <div
      className='gantt-today-line'
      style={todayLineStyle}
      title={`Today: ${today.toLocaleDateString()}`}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            backgroundColor: '#3CB371',
            zIndex: 97,
            overflow: isHover ? 'visible' : 'hidden',
            transition: '0.3s',
          }}></div>
      </div>
    </div>
  );
};

export default React.memo(TodayLine);
