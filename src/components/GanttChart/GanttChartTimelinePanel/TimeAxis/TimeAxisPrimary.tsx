import React from 'react';
import { timeFrameSetting } from '../../../../constants/timeFrameSetting';
import DailyView from './views/PrimaryHeader/DailyView';
import MonthlyView from './views/PrimaryHeader/MonthlyView';
import QuarterMonthView from './views/PrimaryHeader/QuarterMonthView';
import QuarterYearView from './views/PrimaryHeader/QuarterYearView';
import { useConfigStore } from '../../../../stores/useConfigStore';
import YearlyView from './views/PrimaryHeader/YearlyView';
import WeeklyView from './views/PrimaryHeader/WeeklyView';

const TimeAxisPrimary = React.memo(() => {
  const chartTimeFrameView = useConfigStore(state => state.chartTimeFrameView);

  // Render view based on chartTimeFrameView
  const renderView = () => {
    switch (chartTimeFrameView.name) {
      case timeFrameSetting.daily.name:
        return <DailyView />;
      case timeFrameSetting.weekly.name:
        return <WeeklyView />;
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
