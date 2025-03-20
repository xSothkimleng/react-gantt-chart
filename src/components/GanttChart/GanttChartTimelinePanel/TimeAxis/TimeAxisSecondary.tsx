import GanttChartLoading from '../../../Loading';
import { timeFrameSetting } from '../../../../constants/timeFrameSetting';
import { useGanttChart } from '../../../../context/GanttChartContext';

const TimeAxisSecondary = () => {
  const { isLoading, chartDateRange, chartTimeFrameView, zoomWidth } = useGanttChart();

  // Function to get the day name based on the month index, day index, and year
  // @ts-expect-error - TS complains about the missing toLocaleDateString method
  const getDayName = (monthIndex, dayIndex, year) => {
    const date = new Date(year, monthIndex, dayIndex + 1);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (isLoading) {
    return (
      <div style={{ background: 'rgba(0,0,0,0.2)', width: '100%', height: '100%' }}>
        <GanttChartLoading />
      </div>
    );
  }

  // Render functions for each time frame view
  const renderMonthlyView = () => (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {chartDateRange.map(year =>
        year.months.map(month =>
          Array.from({ length: month.days }, (_, dayIndex) => {
            const dayName = getDayName(month.month, dayIndex, year.year);
            const isWeekend = dayName === 'Sat' || dayName === 'Sun';

            return (
              <div
                key={`${dayIndex + 1}-${month.month}-${year.year}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  borderRight: '1px solid lightgray',
                  boxSizing: 'border-box',
                  width: `${chartTimeFrameView.dayWidthUnit + zoomWidth}px`,
                  userSelect: 'none',
                  background: isWeekend ? '#f0f0f0' : 'transparent',
                  fontSize: '0.8em',
                }}>
                <p style={{ margin: '0', padding: '0' }}>
                  {dayName} {dayIndex + 1}
                </p>
              </div>
            );
          }),
        ),
      )}
    </div>
  );

  const renderYearlyView = () => (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {chartDateRange.map((year, indexYear) =>
        year.months.map((month, indexMonth) => (
          <div
            key={`${month.month}-${year.year}-${indexMonth}-${indexYear}`}
            style={{
              textAlign: 'center',
              borderRight: '1px solid lightgray',
              width: `${(chartTimeFrameView.dayWidthUnit + zoomWidth) * month.days}px`,
              boxSizing: 'border-box',
              background: '#f0f0f0',
              fontSize: '0.8em',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <p style={{ margin: '0', padding: '0' }}>
              {new Date(year.year, month.month).toLocaleString('default', { month: 'long' })} - {year.year}
            </p>
          </div>
        )),
      )}
    </div>
  );

  const renderQuarterMonthView = () => (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {chartDateRange.map(year => {
        const quarters = [[], [], [], []];
        year.months.forEach(month => {
          const quarterIndex = Math.floor(month.month / 3);
          // @ts-expect-error - TS complains about the missing push method
          quarters[quarterIndex].push(month);
        });

        return quarters.map((quarter, index) => {
          if (quarter.length === 0) return null;

          return (
            <div key={`Q${index + 1}-${year.year}`} style={{ display: 'flex', flexDirection: 'row' }}>
              {quarter.map((month, index) => (
                <div
                  // @ts-expect-error - TS complains about the missing key prop
                  key={`${month.month}-${year.year}-${index}`}
                  style={{
                    textAlign: 'center',
                    borderRight: '1px solid lightgray',
                    background: '#f0f0f0',
                    fontSize: '0.8em',
                    // @ts-expect-error - TS complains about the missing width prop
                    width: `${(chartTimeFrameView.dayWidthUnit + zoomWidth) * month.days}px`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <p style={{ margin: '0', padding: '0' }}>
                    {/* @ts-expect-error - TS complains about the missing toLocaleString method */}
                    {new Date(year.year, month.month).toLocaleString('default', { month: 'long' })}
                  </p>
                </div>
              ))}
            </div>
          );
        });
      })}
    </div>
  );

  const renderQuarterYearView = () => (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {chartDateRange.map(year => {
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

        return quarters.map((quarterLabel, index) => {
          const monthsInQuarter = year.months.filter(month => Math.floor(month.month / 3) === index);
          if (monthsInQuarter.length === 0) return null;

          const totalDaysInQuarter = monthsInQuarter.reduce((sum, month) => sum + month.days, 0);

          return (
            <div
              key={`${quarterLabel}-${year.year}-${index}`}
              style={{
                textAlign: 'center',
                borderRight: '1px solid lightgray',
                boxSizing: 'border-box',
                background: '#f0f0f0',
                fontSize: '0.8em',
                width: `${totalDaysInQuarter * (chartTimeFrameView.dayWidthUnit + zoomWidth)}px`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <p style={{ margin: '0', padding: '0' }}>
                {quarterLabel} - {year.year}
              </p>
            </div>
          );
        });
      })}
    </div>
  );

  // Render view based on chartTimeFrameView using switch
  const renderView = () => {
    switch (chartTimeFrameView) {
      case timeFrameSetting.monthly:
        return renderMonthlyView();
      case timeFrameSetting.yearly:
        return renderYearlyView();
      case timeFrameSetting.quarterMonth:
        return renderQuarterMonthView();
      case timeFrameSetting.quarterYear:
        return renderQuarterYearView();
      default:
        return null;
    }
  };

  return <>{renderView()}</>;
};

export default TimeAxisSecondary;
