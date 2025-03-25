import { timeFrameSetting } from '../../../../constants/timeFrameSetting';

import MonthlyView from './views/SecondaryHeader/MonthlyView';
import YearlyView from './views/SecondaryHeader/YearlyView';
import QuarterYearView from './views/SecondaryHeader/QuarterYearView';
import QuarterMonthView from './views/SecondaryHeader/QuarterMonthView';
import { useConfigStore } from '../../../../stores';

const TimeAxisSecondary = () => {
  const { chartTimeFrameView } = useConfigStore(state => ({ chartTimeFrameView: state.chartTimeFrameView }));

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
