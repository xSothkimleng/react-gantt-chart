import React from 'react';
import { useConfigStore } from '../../../../../../stores/useConfigStore';
import { useShallow } from 'zustand/shallow';
import './styles.css';

const WeeklyView = React.memo(() => {
  const chartDateRange = useConfigStore(useShallow(state => state.chartDateRange));
  const chartTimeFrameView = useConfigStore(state => state.chartTimeFrameView);
  const zoomWidth = useConfigStore(state => state.zoomWidth);

  // Function to get the week number and year for a date
  const getWeekInfo = (year: number, monthIndex: number, dayIndex: number) => {
    const date = new Date(year, monthIndex, dayIndex + 1);
    date.setHours(0, 0, 0, 0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    date.setDate(date.getDate() + 4 - (date.getDay() || 7));
    // Get first day of year
    const yearStart = new Date(date.getFullYear(), 0, 1);
    // Calculate full weeks to nearest Thursday
    const weekNumber = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

    // The year that "owns" this week - might be different from the date's year
    // for early January or late December dates
    const weekYear = date.getFullYear();

    return { weekNumber, weekYear };
  };

  // Create a flat structure of all days with their week information
  const getAllDaysWithWeekInfo = () => {
    const allDays: {
      year: number;
      month: number;
      dayIndex: number;
      weekNumber: number;
      weekYear: number;
      weekId: string; // Unique week identifier
      date: Date;
    }[] = [];

    chartDateRange.forEach(year => {
      year.months.forEach(month => {
        for (let dayIndex = 0; dayIndex < month.days; dayIndex++) {
          const { weekNumber, weekYear } = getWeekInfo(year.year, month.month, dayIndex);
          allDays.push({
            year: year.year,
            month: month.month,
            dayIndex,
            weekNumber,
            weekYear,
            weekId: `${weekYear}-W${weekNumber}`, // Unique week identifier
            date: new Date(year.year, month.month, dayIndex + 1),
          });
        }
      });
    });

    return allDays.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Group days into continuous week blocks
  const generateWeeklyBlocks = () => {
    const allDays = getAllDaysWithWeekInfo();
    const weekBlocks = [];

    let currentWeekId = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentWeekDays: any[] = [];

    for (let i = 0; i < allDays.length; i++) {
      const day = allDays[i];

      if (currentWeekId === null || currentWeekId !== day.weekId) {
        if (currentWeekId !== null) {
          // Add the completed week
          const firstDay = currentWeekDays[0];
          weekBlocks.push({
            weekNumber: firstDay.weekNumber,
            weekYear: firstDay.weekYear,
            daysInWeek: currentWeekDays.length,
            days: currentWeekDays,
          });
        }

        currentWeekId = day.weekId;
        currentWeekDays = [day];
      } else {
        currentWeekDays.push(day);
      }
    }

    // Add the last week
    if (currentWeekDays.length > 0) {
      const firstDay = currentWeekDays[0];
      weekBlocks.push({
        weekNumber: firstDay.weekNumber,
        weekYear: firstDay.weekYear,
        daysInWeek: currentWeekDays.length,
        days: currentWeekDays,
      });
    }

    return weekBlocks;
  };

  // Function to calculate the width of a week block
  const getWeekWidth = (daysInWeek: number) => {
    return daysInWeek * (chartTimeFrameView.dayWidthUnit + zoomWidth);
  };

  const weekBlocks = generateWeeklyBlocks();

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: `${25}px` }}>
      {weekBlocks.map((week, index) => (
        <div
          key={`week-${week.weekNumber}-${week.weekYear}-${index}`}
          className='gantt-secondary-header-weekly'
          style={{
            width: `${getWeekWidth(week.daysInWeek)}px`,
            background: 'white',
            borderBottom: '1px solid lightgray',
          }}>
          <p style={{ margin: '0', padding: '0' }}>Week {week.weekNumber}</p>
        </div>
      ))}
    </div>
  );
});

export default WeeklyView;
