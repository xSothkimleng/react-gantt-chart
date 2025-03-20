import { useGanttChart } from '../../../../../../context/GanttChartContext';
import './styles.css';

const YearlyView = () => {
  const { chartDateRange, chartTimeFrameView, zoomWidth } = useGanttChart();

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
};

export default YearlyView;
