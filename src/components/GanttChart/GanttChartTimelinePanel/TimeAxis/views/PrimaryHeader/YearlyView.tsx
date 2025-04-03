import { useGanttChartStore } from '../../../../../../stores/useGanttChartStore';
import './styles.css';

const YearlyView = () => {
  const chartDateRange = useGanttChartStore(state => state.chartDateRange);
  const chartTimeFrameView = useGanttChartStore(state => state.chartTimeFrameView);
  const zoomWidth = useGanttChartStore(state => state.zoomWidth);

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
};

export default YearlyView;
