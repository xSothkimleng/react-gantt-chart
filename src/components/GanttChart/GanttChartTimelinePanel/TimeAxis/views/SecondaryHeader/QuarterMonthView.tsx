import React from 'react';
import { useConfigStore } from '../../../../../../stores/useConfigStore';
import { useShallow } from 'zustand/shallow';
import './styles.css';

const QuarterMonthView = React.memo(() => {
  const chartDateRange = useConfigStore(useShallow(state => state.chartDateRange));
  const chartTimeFrameView = useConfigStore(state => state.chartTimeFrameView);
  const zoomWidth = useConfigStore(state => state.zoomWidth);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {chartDateRange.map(year => {
        const quarters = [[], [], [], []];
        year.months.forEach(month => {
          const quarterIndex = Math.floor(month.month / 3);
          // @ts-expect-error - TS complains about the missing push method
          quarters[quarterIndex].push(month);
        });

        return quarters.map((quarter, index) => {
          if (quarter.length === 0) return null;

          return (
            <div key={`Q${index + 1}-${year.year}`} style={{ display: 'flex', flexDirection: 'row' }}>
              {quarter.map((month, index) => (
                <div
                  // @ts-expect-error - TS complains about the missing key prop
                  key={`${month.month}-${year.year}-${index}`}
                  className='gantt-secondary-header-quarter-month'
                  style={{
                    // @ts-expect-error - TS complains about the missing width prop
                    width: `${(chartTimeFrameView.dayWidthUnit + zoomWidth) * month.days}px`,
                  }}>
                  <p style={{ margin: '0', padding: '0' }}>
                    {/* @ts-expect-error - TS complains about the missing toLocaleString method */}
                    {new Date(year.year, month.month).toLocaleString('default', { month: 'long' })}
                  </p>
                </div>
              ))}
            </div>
          );
        });
      })}
    </div>
  );
});

export default QuarterMonthView;
