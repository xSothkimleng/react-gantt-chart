import { useGanttChartStore } from '../../../../../../stores/GanttChartStore';
import './styles.css';

const QuarterYearView = () => {
  const chartDateRange = useGanttChartStore(state => state.chartDateRange);
  const chartTimeFrameView = useGanttChartStore(state => state.chartTimeFrameView);
  const zoomWidth = useGanttChartStore(state => state.zoomWidth);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {chartDateRange.map(year => {
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

        return quarters.map((quarterLabel, index) => {
          const monthsInQuarter = year.months.filter(month => Math.floor(month.month / 3) === index);
          if (monthsInQuarter.length === 0) return null;

          const totalDaysInQuarter = monthsInQuarter.reduce((sum, month) => sum + month.days, 0);

          return (
            <div
              key={`${quarterLabel}-${year.year}-${index}`}
              className='gantt-secondary-header-quarter-year '
              style={{
                width: `${totalDaysInQuarter * (chartTimeFrameView.dayWidthUnit + zoomWidth)}px`,
              }}>
              <p style={{ margin: '0', padding: '0' }}>
                {quarterLabel} - {year.year}
              </p>
            </div>
          );
        });
      })}
    </div>
  );
};

export default QuarterYearView;
