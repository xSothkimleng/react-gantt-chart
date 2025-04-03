import React from 'react';
import { timeFrameSetting } from '../../../../constants/timeFrameSetting';
import MonthlyView from './views/PrimaryHeader/MonthlyView';
import YearlyView from './views/PrimaryHeader/YearlyView';
import QuarterMonthView from './views/PrimaryHeader/QuarterMonthView';
import QuarterYearView from './views/PrimaryHeader/QuarterYearView';
import { useConfigStore } from '../../../../stores/useConfigStore';

const TimeAxisPrimary = React.memo(() => {
  const chartTimeFrameView = useConfigStore(state => state.chartTimeFrameView);

  // Render view based on chartTimeFrameView
  const renderView = () => {
    switch (chartTimeFrameView.name) {
      case timeFrameSetting.monthly.name:
        return <MonthlyView />;
      case timeFrameSetting.yearly.name:
        return <YearlyView />;
      case timeFrameSetting.quarterMonth.name:
        return <QuarterMonthView />;
      case timeFrameSetting.quarterYear.name:
        return <QuarterYearView />;
      default:
        return null;
    }
  };

  return renderView();
});

export default TimeAxisPrimary;
