import { timeFrameSetting } from '../../../../constants/timeFrameSetting';

import MonthlyView from './views/SecondaryHeader/MonthlyView';
import YearlyView from './views/SecondaryHeader/YearlyView';
import QuarterYearView from './views/SecondaryHeader/QuarterYearView';
import QuarterMonthView from './views/SecondaryHeader/QuarterMonthView';
import { useGanttChartStore } from '../../../../stores/useGanttChartStore';

const TimeAxisSecondary = () => {
  const chartTimeFrameView = useGanttChartStore(state => state.chartTimeFrameView);

  // Render view based on chartTimeFrameView using switch
  const renderView = () => {
    switch (chartTimeFrameView.name) {
      case timeFrameSetting.monthly.name:
        return MonthlyView();
      case timeFrameSetting.yearly.name:
        return YearlyView();
      case timeFrameSetting.quarterMonth.name:
        return QuarterMonthView();
      case timeFrameSetting.quarterYear.name:
        return QuarterYearView();
      default:
        return null;
    }
  };

  return renderView();
};

export default TimeAxisSecondary;
