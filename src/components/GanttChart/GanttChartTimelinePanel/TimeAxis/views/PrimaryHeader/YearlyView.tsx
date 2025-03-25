import { useConfigStore, useUIStore } from '../../../../../../stores';
import './styles.css';

const YearlyView = () => {
  const { chartDateRange } = useUIStore(state => ({ chartDateRange: state.chartDateRange }));
  const { chartTimeFrameView, zoomWidth } = useConfigStore(state => ({
    chartTimeFrameView: state.chartTimeFrameView,
    zoomWidth: state.zoomWidth,
  }));

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
