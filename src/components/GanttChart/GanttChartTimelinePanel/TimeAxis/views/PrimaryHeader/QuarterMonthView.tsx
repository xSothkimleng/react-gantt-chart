import { useGanttChart } from '../../../../../../context/GanttChartContext';
import './styles.css';

const QuarterMonthView = () => {
  const { chartDateRange, chartTimeFrameView, zoomWidth } = useGanttChart();

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {chartDateRange.map(year => {
        const quarters = [[], [], [], []];
        // @ts-expect-error - TS complains about the forEach return type
        year.months.forEach(month => quarters[Math.floor(month.month / 3)].push(month));

        return quarters.map((quarter, index) => {
          if (quarter.length === 0) return null;
          // @ts-expect-error - TS complains about the forEach return type
          const totalDaysInQuarter = quarter.reduce((sum, month) => sum + month.days, 0);

          return (
            <div
              key={`Q${index + 1}-${year.year}`}
              className='gantt-primary-header-quarter-month'
              style={{
                width: `${totalDaysInQuarter * (chartTimeFrameView.dayWidthUnit + zoomWidth) + quarter.length - 1}px`,
              }}>
              Q{index + 1} - {year.year}
            </div>
          );
        });
      })}
    </div>
  );
};

export default QuarterMonthView;
