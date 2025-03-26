import React, { useCallback, useEffect, useRef, useState } from 'react';
import TimeAxisPrimary from './TimeAxis/TimeAxisPrimary';
import TimeAxisSecondary from './TimeAxis/TimeAxisSecondary';
import GanttBarPanel from './GanttBarPanel';
import { DateRangeType, MonthDataType } from '../../../types/dateRangeType';
import { initializeDateRange } from '../../../utils/dateUtils';
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

  // State to track if date range has been initialized
  const [dateRangeInitialized, setDateRangeInitialized] = useState(false);

  // Create ref for time panel
  const timelinePanelRef = useRef<HTMLDivElement>(null);
  const { setTimelinePanelRef } = useUIStore();

  // Track whether ref has been set to avoid multiple setTimelinePanelRef calls
  const refHasBeenSet = useRef(false);

  // Get interaction state and actions
  const interactionState = useInteractionStore(state => state.interactionState);
  const startTimelineDrag = useInteractionStore(state => state.startTimelineDrag);

  const prevChartDateRange = useRef<DateRangeType>([]);
  const prevTimeFrameView = useRef(chartTimeFrameView);

  // Set timelinePanelRef in the store once on component mount
  useEffect(() => {
    if (timelinePanelRef.current && !refHasBeenSet.current) {
      setTimelinePanelRef(timelinePanelRef);
      refHasBeenSet.current = true;
    }
  }, [setTimelinePanelRef]);

  const generateEmptyChartDateRange = useCallback(() => {
    const dateRange: DateRangeType = [];

    // Get today's date and set start and end dates
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear() + 6, today.getMonth(), 1);
    const current = new Date(startDate);

    while (current < endDate) {
      const currentYear = current.getFullYear();
      const months: MonthDataType[] = [];
      let totalDays = 0;

      // Loop through each month of the current year
      while (current.getFullYear() === currentYear && current < endDate) {
        const currentMonth = current.getMonth();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        totalDays += daysInMonth;

        months.push({
          month: currentMonth,
          days: daysInMonth,
        });

        current.setMonth(currentMonth + 1);
        current.setDate(1);
      }

      dateRange.push({
        year: currentYear,
        months: months,
        totalDayAmount: totalDays,
      });
    }

    return dateRange;
  }, []);

  // Calculate the new date range
  const computeNewDateRange = useCallback(() => {
    if (rows.length === 0) {
      const emptyRange = generateEmptyChartDateRange();
      setChartDateRange(emptyRange);
      if (prevChartDateRange.current.length === 0) {
        prevChartDateRange.current = emptyRange;
      }
      return;
    }

    const allDates = rows.flatMap(row => [new Date(row.start), new Date(row.end)]);
    const earliestDate = new Date(Math.min(...allDates.map(date => date.getTime())));
    const latestDate = new Date(Math.max(...allDates.map(date => date.getTime())));

    const dateRangeResult = initializeDateRange(earliestDate, latestDate);
    setChartDateRange(dateRangeResult);
    if (prevChartDateRange.current.length === 0) {
      prevChartDateRange.current = dateRangeResult;
    }
  }, [rows, setChartDateRange, generateEmptyChartDateRange]);

  // Initialize the date range - only run once and then set flag
  useEffect(() => {
    if (!dateRangeInitialized) {
      // First set loading state to true
      setIsLoading(true);

      // Check what type of initialization is needed
      if (!rows || rows.length === 0) {
        const emptyRange = generateEmptyChartDateRange();
        setChartDateRange(emptyRange);
      } else if (isChartBorderReached) {
        setIsChartBorderReached(false);
        computeNewDateRange();
      } else if (chartDateRange.length === 0) {
        computeNewDateRange();
      }

      // Mark as initialized and finish loading
      setDateRangeInitialized(true);
      setIsLoading(false);
    }
  }, [
    dateRangeInitialized,
    rows,
    isChartBorderReached,
    chartDateRange.length,
    generateEmptyChartDateRange,
    computeNewDateRange,
    setChartDateRange,
    setIsChartBorderReached,
    setIsLoading,
  ]);

  // Handle time frame view changes
  useEffect(() => {
    if (dateRangeInitialized && prevTimeFrameView.current !== chartTimeFrameView) {
      prevTimeFrameView.current = chartTimeFrameView;

      // Don't re-initialize completely, just recompute the date range
      if (rows.length === 0) {
        const emptyRange = generateEmptyChartDateRange();
        setChartDateRange(emptyRange);
      } else {
        computeNewDateRange();
      }
    }
  }, [dateRangeInitialized, chartTimeFrameView, rows, generateEmptyChartDateRange, computeNewDateRange, setChartDateRange]);

  // Safe timeline panel drag handler
  const handleTimelinePanelMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Don't initiate timeline dragging if we clicked on a gantt bar or resizer
      if ((e.target as HTMLElement).closest('.gantt-bar') || (e.target as HTMLElement).closest('.gantt-bar-resize-handle')) {
        return;
      }

      const container = timelinePanelRef.current;
      if (container) {
        startTimelineDrag({
          startX: e.pageX - container.offsetLeft,
          scrollLeft: container.scrollLeft,
        });
        container.style.cursor = 'grabbing';
      }
    },
    [startTimelineDrag],
  );

  // If still loading or date range not initialized, show loading state
  if (!dateRangeInitialized || chartDateRange.length === 0) {
    return <div>Loading timeline...</div>;
  }

  return (
    <div
      ref={timelinePanelRef}
      onMouseDown={handleTimelinePanelMouseDown}
      className='gnatt-timeline-panel'
      style={{
        cursor: interactionState.mode === 'timelineDragging' ? 'grabbing' : 'grab',
        position: 'relative',
        zIndex: 1,
      }}>
      <TimeAxisPrimary />
      <TimeAxisSecondary />
      <GanttBarPanel />
    </div>
  );
};

export default React.memo(GanttChartTimelinePanel);
