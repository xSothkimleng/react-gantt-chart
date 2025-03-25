import { useGanttChartStore } from '../../../../../../stores/GanttChartStore';
import './styles.css';

const MonthlyView = () => {
  const chartDateRange = useGanttChartStore(state => state.chartDateRange);
  const chartTimeFrameView = useGanttChartStore(state => state.chartTimeFrameView);
  const zoomWidth = useGanttChartStore(state => state.zoomWidth);

  // Function to get the day name based on the month index, day index, and year
  // @ts-expect-error - TS complains about the missing toLocaleDateString method
  const getDayName = (monthIndex, dayIndex, year) => {
    const date = new Date(year, monthIndex, dayIndex + 1);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {chartDateRange.map(year =>
        year.months.map(month =>
          Array.from({ length: month.days }, (_, dayIndex) => {
            const dayName = getDayName(month.month, dayIndex, year.year);
            const isWeekend = dayName === 'Sat' || dayName === 'Sun';

            return (
              <div
                key={`${dayIndex + 1}-${month.month}-${year.year}`}
                className='gantt-secondary-header-monthly'
                style={{
                  width: `${chartTimeFrameView.dayWidthUnit + zoomWidth}px`,
                  background: isWeekend ? '#f0f0f0' : 'transparent',
                }}>
                <p style={{ margin: '0', padding: '0' }}>
                  {dayName} {dayIndex + 1}
                </p>
              </div>
            );
          }),
        ),
      )}
    </div>
  );
};

export default MonthlyView;
