import React from 'react';
import { timeFrameSetting } from '../../../../constants/timeFrameSetting';
import DailyView from './views/SecondaryHeader/DailyView';
import MonthlyView from './views/SecondaryHeader/MonthlyView';
import QuarterYearView from './views/SecondaryHeader/QuarterYearView';
import QuarterMonthView from './views/SecondaryHeader/QuarterMonthView';
import { useConfigStore } from '../../../../stores/useConfigStore';
import YearlyView from './views/SecondaryHeader/YearlyView';
import WeeklyView from './views/SecondaryHeader/WeeklyView';

const TimeAxisSecondary = React.memo(() => {
  const chartTimeFrameView = useConfigStore(state => state.chartTimeFrameView);

  // Render view based on chartTimeFrameView using switch
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

export default TimeAxisSecondary;
