import { useGanttChart } from '../../../../../../context/GanttChartContext';
import './styles.css';

const QuarterYearView = () => {
  const { chartDateRange, chartTimeFrameView, zoomWidth } = useGanttChart();

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {chartDateRange.map(year => {
        return (
          <div
            key={`${year.year}`}
            className='gantt-primary-header-quarter-year'
            style={{
              width: `${year.totalDayAmount * (chartTimeFrameView.dayWidthUnit + zoomWidth)}px`,
            }}>
            {year.year}
          </div>
        );
      })}
    </div>
  );
};

export default QuarterYearView;
