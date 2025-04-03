import React from 'react';
import { useConfigStore } from '../../../../../../stores/useConfigStore';
import { useShallow } from 'zustand/shallow';
import './styles.css';

const YearlyView = React.memo(() => {
  const chartDateRange = useConfigStore(useShallow(state => state.chartDateRange));
  const chartTimeFrameView = useConfigStore(state => state.chartTimeFrameView);
  const zoomWidth = useConfigStore(state => state.zoomWidth);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {chartDateRange.map((year, index) => (
        <div
          key={`${year.year}-${index}`}
          className='gantt-primary-header-yearly'
          style={{
            width: `${year.totalDayAmount * (chartTimeFrameView.dayWidthUnit + zoomWidth)}px`,
          }}>
          {year.year}
        </div>
      ))}
    </div>
  );
});

export default YearlyView;
