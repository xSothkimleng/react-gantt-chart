import React, { useCallback, useEffect, useRef } from 'react';
import TimeAxisPrimary from './TimeAxis/TimeAxisPrimary';
import TimeAxisSecondary from './TimeAxis/TimeAxisSecondary';
import GanttBarPanel from './GanttBarPanel';
import { DateRangeType, MonthDataType } from '../../../types/dateRangeType';
import { initializeDateRange } from '../../../utils/dateUtils';
// import { getTotalDayInChartDateRange } from '../../../utils/ganttBarUtils';
import './styles.css';
import { useGanttChartStore } from '../../../stores/GanttChartStore';
import { useInteractionStore } from '../../../stores/useInteractionStore';
import { useUIStore } from '../../../stores/useUIStore';

const GanttChartTimelinePanel = () => {
  const rows = useGanttChartStore(state => state.rows);
  const chartTimeFrameView = useGanttChartStore(state => state.chartTimeFrameView);
  const chartDateRange = useGanttChartStore(state => state.chartDateRange);
  const isChartBorderReached = useGanttChartStore(state => state.isChartBorderReached);
  const setChartDateRange = useGanttChartStore(state => state.setChartDateRange);
  const setIsLoading = useGanttChartStore(state => state.setIsLoading);
  const setIsChartBorderReached = useGanttChartStore(state => state.setIsChartBorderReached);

  // Get UI store actions and state
  const { setTimelinePanelRef } = useUIStore();
  const timelinePanelRef = useUIStore(state => state.timelinePanelRef);

  // Get interaction state and actions
  const interactionState = useInteractionStore(state => state.interactionState);
  const startTimelineDrag = useInteractionStore(state => state.startTimelineDrag);
  // const setPreviousContainerScrollLeftPosition = useInteractionStore(state => state.setPreviousContainerScrollLeftPosition);

  // Create local refs if not already provided via store
  const localTimelinePanelRef = useRef<HTMLDivElement | null>(null);
  const prevChartDateRange = useRef<DateRangeType>([]);
  const prevTimeFrameView = useRef(chartTimeFrameView);

  // const centerPositionRef = useRef<number | null>(null);

  // Set timelinePanelRef in the store if we're using the local ref
  // useEffect(() => {
  //   if (!timelinePanelRef && localTimelinePanelRef.current) {
  //     setTimelinePanelRef(localTimelinePanelRef);
  //   }
  // }, [timelinePanelRef, setTimelinePanelRef]);

  // Set timelinePanelRef in the store if we're using the local ref
  useEffect(() => {
    if (localTimelinePanelRef.current) {
      setTimelinePanelRef(localTimelinePanelRef);
    }
  }, [setTimelinePanelRef]);

  // Use either the store's ref or our local ref
  // const panelRef = timelinePanelRef || localTimelinePanelRef;
  const panelRef = timelinePanelRef || localTimelinePanelRef;

  const generateEmptyChartDateRange = () => {
    const dateRange: DateRangeType = [];

    // Get today's date and set start and end dates
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Start of the current month
    const endDate = new Date(today.getFullYear() + 6, today.getMonth(), 1); // Start of the same month 3 years later
    const current = new Date(startDate);

    while (current < endDate) {
      const currentYear = current.getFullYear();
      const months: MonthDataType[] = [];
      let totalDays = 0;

      // Loop through each month of the current year
      while (current.getFullYear() === currentYear && current < endDate) {
        const currentMonth = current.getMonth();

        // Get the total number of days in the current month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        totalDays += daysInMonth;

        // Add the month data to the months array
        months.push({
          month: currentMonth,
          days: daysInMonth,
        });

        // Move to the first day of the next month
        current.setMonth(currentMonth + 1);
        current.setDate(1);
      }

      // After finishing all months of the current year, add the year data to dateRange
      dateRange.push({
        year: currentYear,
        months: months,
        totalDayAmount: totalDays,
      });
    }

    setChartDateRange(dateRange);
    if (prevChartDateRange.current.length === 0) prevChartDateRange.current = dateRange;
  };

  // Calculate the new date range
  const ComputeNewDateRange = useCallback(() => {
    const allDates = rows.flatMap(row => [new Date(row.start), new Date(row.end)]);

    if (allDates.length === 0) {
      generateEmptyChartDateRange();
      return;
    }

    const earliestDate = new Date(Math.min(...allDates.map(date => date.getTime())));
    const latestDate = new Date(Math.max(...allDates.map(date => date.getTime())));

    const DateRangeResult = initializeDateRange(earliestDate, latestDate);
    setChartDateRange(DateRangeResult);
    if (prevChartDateRange.current.length === 0) {
      prevChartDateRange.current = DateRangeResult;
    }
  }, [rows, setChartDateRange]);

  const handleInitializeDateRange = () => {
    if (!rows || rows.length === 0) {
      // check Row list if there are row, if not generate empty chart
      generateEmptyChartDateRange();
    } else if (isChartBorderReached) {
      // check if chart boundary is reached to expand the chart
      setIsChartBorderReached(false);
      ComputeNewDateRange();
    } else if (chartDateRange.length === 0) {
      // first load chart if there are row in the list
      ComputeNewDateRange();
    }
  };

  // New timeline panel drag and move handler
  const handleTimelinePanelMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't initiate timeline dragging if we clicked on a gantt bar or resizer
    if ((e.target as HTMLElement).closest('.gantt-bar') || (e.target as HTMLElement).closest('.gantt-bar-resize-handle')) {
      return;
    }

    const container = panelRef.current;
    if (container) {
      startTimelineDrag({
        startX: e.pageX - container.offsetLeft,
        scrollLeft: container.scrollLeft,
      });
      container.style.cursor = 'grabbing';
    }
  };

  // Initialize the date range

  useEffect(() => {
    handleInitializeDateRange();
    setIsLoading(false);
  }, [rows, setIsLoading]);

  // Handle time frame view changes
  useEffect(() => {
    if (prevTimeFrameView.current !== chartTimeFrameView) {
      prevTimeFrameView.current = chartTimeFrameView;
      handleInitializeDateRange();
    }
  }, [chartTimeFrameView]);

  return (
    <div
      ref={timelinePanelRef}
      onMouseDown={handleTimelinePanelMouseDown}
      className='gnatt-timeline-panel'
      style={{
        cursor: interactionState.mode === 'timelineDragging' ? 'grabbing' : 'grab',
      }}>
      <TimeAxisPrimary />
      <TimeAxisSecondary />
      <GanttBarPanel />
    </div>
  );
};

export default GanttChartTimelinePanel;
