import { useGanttChartStore } from '../../../../../../stores/useGanttChartStore';
import './styles.css';

const MonthlyView = () => {
  const chartDateRange = useGanttChartStore(state => state.chartDateRange);
  const chartTimeFrameView = useGanttChartStore(state => state.chartTimeFrameView);
  const zoomWidth = useGanttChartStore(state => state.zoomWidth);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {chartDateRange.map((year, indexYear) =>
        year.months.map((month, indexMonth) => (
          <div
            key={`${month.month}-${indexMonth}-${year.year}-${indexYear}`}
            className='gantt-primary-header-monthly'
            style={{
              width: `${month.days * (chartTimeFrameView.dayWidthUnit + zoomWidth)}px`,
            }}>
            <p style={{ margin: '0', padding: '0' }}>
              {new Date(year.year, month.month).toLocaleString('default', { month: 'long' })} {year.year}
            </p>
          </div>
        )),
      )}
    </div>
  );
};

export default MonthlyView;
