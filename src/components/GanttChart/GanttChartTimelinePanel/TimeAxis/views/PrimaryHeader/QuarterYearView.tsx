import { useConfigStore, useUIStore } from '../../../../../../stores';
import './styles.css';

const QuarterYearView = () => {
  const { chartDateRange } = useUIStore(state => ({ chartDateRange: state.chartDateRange }));
  const { chartTimeFrameView, zoomWidth } = useConfigStore(state => ({
    chartTimeFrameView: state.chartTimeFrameView,
    zoomWidth: state.zoomWidth,
  }));

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
