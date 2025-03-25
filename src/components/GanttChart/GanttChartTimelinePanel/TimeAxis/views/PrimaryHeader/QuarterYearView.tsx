import { useGanttChartStore } from '../../../../../../stores/GanttChartStore';
import './styles.css';

const QuarterYearView = () => {
  const chartDateRange = useGanttChartStore(state => state.chartDateRange);
  const chartTimeFrameView = useGanttChartStore(state => state.chartTimeFrameView);
  const zoomWidth = useGanttChartStore(state => state.zoomWidth);

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
