import GanttChartLoading from '../../../Loading';
import { timeFrameSetting } from '../../../../constants/timeFrameSetting';
import { useGanttChart } from '../../../../context/GanttChartContext';

const TimeAxisPrimary = () => {
  const { isLoading, chartDateRange, chartTimeFrameView, zoomWidth } = useGanttChart();

  if (isLoading) {
    return (
      <div style={{ background: 'rgba(0,0,0,0.2)', width: '100%', height: '100%' }}>
        <GanttChartLoading />
      </div>
    );
  }

  // View render functions
  const renderMonthlyView = () => (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {chartDateRange.map((year, indexYear) =>
        year.months.map((month, indexMonth) => (
          <div
            key={`${month.month}-${indexMonth}-${year.year}-${indexYear}`}
            style={{
              width: `${month.days * (chartTimeFrameView.dayWidthUnit + zoomWidth)}px`,
              borderTop: '1px solid lightgray',
              borderBottom: '1px solid lightgray',
              borderRight: '1px solid lightgray',
              fontWeight: '500',
              boxSizing: 'border-box',
              userSelect: 'none',
              background: '#f0f0f0',
              fontSize: '0.8em',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              padding: '0 10px',
            }}>
            <p style={{ margin: '0', padding: '0' }}>
              {new Date(year.year, month.month).toLocaleString('default', { month: 'long' })} {year.year}
            </p>
          </div>
        )),
      )}
    </div>
  );

  const renderYearlyView = () => (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {chartDateRange.map((year, index) => (
        <div
          key={`${year.year}-${index}`}
          style={{
            width: `${year.totalDayAmount * (chartTimeFrameView.dayWidthUnit + zoomWidth)}px`,
            borderTop: '1px solid lightgray',
            borderBottom: '1px solid lightgray',
            borderRight: '1px solid lightgray',
            fontWeight: 'bold',
            boxSizing: 'border-box',
            userSelect: 'none',
            background: '#f0f0f0',
            fontSize: '0.8em',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: '0 10px',
          }}>
          {year.year}
        </div>
      ))}
    </div>
  );

  const renderQuarterMonthView = () => (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {chartDateRange.map(year => {
        const quarters = [[], [], [], []];
        // @ts-expect-error - TS complains about the forEach return type
        year.months.forEach(month => quarters[Math.floor(month.month / 3)].push(month));

        return quarters.map((quarter, index) => {
          if (quarter.length === 0) return null;
          // @ts-expect-error - TS complains about the forEach return type
          const totalDaysInQuarter = quarter.reduce((sum, month) => sum + month.days, 0);

          return (
            <div
              key={`Q${index + 1}-${year.year}`}
              style={{
                width: `${totalDaysInQuarter * (chartTimeFrameView.dayWidthUnit + zoomWidth) + quarter.length - 1}px`,
                borderTop: '1px solid lightgray',
                borderBottom: '1px solid lightgray',
                borderRight: '1px solid lightgray',
                fontWeight: 'bold',
                userSelect: 'none',
                background: '#f0f0f0',
                fontSize: '0.8em',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              Q{index + 1} - {year.year}
            </div>
          );
        });
      })}
    </div>
  );

  const renderQuarterYearView = () => (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {chartDateRange.map(year => {
        return (
          <div
            key={`${year.year}`}
            style={{
              width: `${year.totalDayAmount * (chartTimeFrameView.dayWidthUnit + zoomWidth)}px`,
              borderTop: '1px solid lightgray',
              borderBottom: '1px solid lightgray',
              borderRight: '1px solid lightgray',
              fontWeight: 'bold',
              userSelect: 'none',
              boxSizing: 'border-box',
              background: '#f0f0f0',
              fontSize: '0.8em',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {year.year}
          </div>
        );
      })}
    </div>
  );

  // Render view based on chartTimeFrameView
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

export default TimeAxisPrimary;
