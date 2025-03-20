import { useGanttChart } from '../../../../../../context/GanttChartContext';
import './styles.css';

const YearlyView = () => {
  const { chartDateRange, chartTimeFrameView, zoomWidth } = useGanttChart();

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
