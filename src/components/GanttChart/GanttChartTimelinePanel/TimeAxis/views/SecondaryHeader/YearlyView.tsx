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
      {chartDateRange.map((year, indexYear) =>
        year.months.map((month, indexMonth) => (
          <div
            key={`${month.month}-${year.year}-${indexMonth}-${indexYear}`}
            className='gantt-secondary-header-yearly'
            style={{
              width: `${(chartTimeFrameView.dayWidthUnit + zoomWidth) * month.days}px`,
            }}>
            <p style={{ margin: '0', padding: '0' }}>
              {new Date(year.year, month.month).toLocaleString('default', { month: 'long' })} - {year.year}
            </p>
          </div>
        )),
      )}
    </div>
  );
});

export default YearlyView;
