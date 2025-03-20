import GanttChartLoading from '../../../Loading';
import { timeFrameSetting } from '../../../../constants/timeFrameSetting';
import { useGanttChart } from '../../../../context/GanttChartContext';
import MonthlyView from './views/PrimaryHeader/MonthlyView';
import YearlyView from './views/PrimaryHeader/YearlyView';
import QuarterMonthView from './views/PrimaryHeader/QuarterMonthView';
import QuarterYearView from './views/PrimaryHeader/QuarterYearView';

const TimeAxisPrimary = () => {
  const { isLoading, chartTimeFrameView } = useGanttChart();

  if (isLoading) {
    return (
      <div style={{ background: 'rgba(0,0,0,0.2)', width: '100%', height: '100%' }}>
        <GanttChartLoading />
      </div>
    );
  }

  // Render view based on chartTimeFrameView
  const renderView = () => {
    switch (chartTimeFrameView) {
      case timeFrameSetting.monthly:
        return MonthlyView();
      case timeFrameSetting.yearly:
        return YearlyView();
      case timeFrameSetting.quarterMonth:
        return QuarterMonthView();
      case timeFrameSetting.quarterYear:
        return QuarterYearView();
      default:
        return null;
    }
  };

  return renderView();
};

export default TimeAxisPrimary;
