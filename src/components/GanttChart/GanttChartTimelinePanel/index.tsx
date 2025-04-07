// Updated src/components/GanttChart/GanttChartTimelinePanel/index.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import TimeAxisPrimary from './TimeAxis/TimeAxisPrimary';
import TimeAxisSecondary from './TimeAxis/TimeAxisSecondary';
import GanttBarPanel from './GanttBarPanel';
import { DateRangeType, MonthDataType } from '../../../types/dateRangeType';
import { initializeDateRange } from '../../../utils/dateUtils';
import { scrollToEarliestBar } from '../../../utils/ganttBarUtils';
import { useRowsStore } from '../../../stores/useRowsStore';
import { useConfigStore } from '../../../stores/useConfigStore';
import { useInteractionStore } from '../../../stores/useInteractionStore';
import { useUIStore } from '../../../stores/useUIStore';
import { useShallow } from 'zustand/shallow';
import './styles.css';

const GanttChartTimelinePanel = () => {
  // optimize approach
  const dateBoundaries = useRowsStore(useShallow(state => state.getDateBoundaries()));
  const rowsCount = useRowsStore(state => state.getRowsCount());
  const getAllRows = useRowsStore(state => state.getAllRows);

  // Get chart configuration from configStore
  const chartTimeFrameView = useConfigStore(state => state.chartTimeFrameView);
  const chartDateRange = useConfigStore(useShallow(state => state.chartDateRange));
  const setChartDateRange = useConfigStore(useShallow(state => state.setChartDateRange));
  const setIsLoading = useConfigStore(state => state.setIsLoading);
  const getDayWidth = useConfigStore(state => state.getDayWidth);

  // Get interaction state
  const isChartBorderReached = useInteractionStore(state => state.isChartBorderReached);
  const setIsChartBorderReached = useInteractionStore(state => state.setIsChartBorderReached);
  const interactionState = useInteractionStore(state => state.interactionState);
  const startTimelineDrag = useInteractionStore(state => state.startTimelineDrag);

  // Get UI elements
  const setTimelinePanelRef = useUIStore(state => state.setTimelinePanelRef);

  // State to track if date range has been initialized
  const [dateRangeInitialized, setDateRangeInitialized] = useState(false);
  // Add a state to track if initial scroll has been performed
  const [initialScrollPerformed, setInitialScrollPerformed] = useState(false);
  // Add a ref to track the previous view for view changes
  const previousViewRef = useRef(chartTimeFrameView.name);

  // Create ref for time panel
  const timelinePanelRef = useRef<HTMLDivElement>(null);

  // Track whether ref has been set to avoid multiple setTimelinePanelRef calls
  const refHasBeenSet = useRef(false);

  const prevChartDateRange = useRef<DateRangeType>([]);
  const prevTimeFrameView = useRef(chartTimeFrameView);

  // Set timelinePanelRef in the store once on component mount
  useEffect(() => {
    if (timelinePanelRef.current) {
      // Make sure we're passing the actual DOM element reference
      setTimelinePanelRef(timelinePanelRef);
      refHasBeenSet.current = true;
    }
  }, [setTimelinePanelRef, timelinePanelRef.current]);

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
    if (rowsCount === 0) {
      const emptyRange = generateEmptyChartDateRange();
      setChartDateRange(emptyRange);
      if (prevChartDateRange.current.length === 0) {
        prevChartDateRange.current = emptyRange;
      }
      return;
    }

    const { earliest: earliestDate, latest: latestDate } = dateBoundaries;

    console.log('New date range:');
    console.log('Earliest date:', earliestDate);
    console.log('Latest date:', latestDate);

    const dateRangeResult = initializeDateRange(earliestDate, latestDate);
    setChartDateRange(dateRangeResult);
    if (prevChartDateRange.current.length === 0) {
      prevChartDateRange.current = dateRangeResult;
    }
  }, [rowsCount, dateBoundaries, setChartDateRange, generateEmptyChartDateRange]);

  // Initialize the date range - only run once and then set flag
  useEffect(() => {
    if (!dateRangeInitialized) {
      // First set loading state to true
      setIsLoading(true);

      // Check what type of initialization is needed
      if (rowsCount === 0) {
        console.log('No rows found, initializing empty date range...');
        const emptyRange = generateEmptyChartDateRange();
        setChartDateRange(emptyRange);
      } else if (isChartBorderReached) {
        console.log('Chart border reached, reinitializing date range...');
        setIsChartBorderReached(false);
        computeNewDateRange();
      } else if (chartDateRange.length === 0) {
        console.log('Chart date range is empty, initializing date range...');
        computeNewDateRange();
      }

      // Mark as initialized and finish loading
      console.log('Date range initialized zz:');

      setDateRangeInitialized(true);
      setIsLoading(false);
    }
  }, [
    dateRangeInitialized,
    rowsCount,
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
      if (rowsCount === 0) {
        const emptyRange = generateEmptyChartDateRange();
        setChartDateRange(emptyRange);
      } else {
        computeNewDateRange();
      }

      // Reset initial scroll flag when view changes to trigger a new scroll
      setInitialScrollPerformed(false);

      // Track that the view has changed
      previousViewRef.current = chartTimeFrameView.name;
    }
  }, [dateRangeInitialized, chartTimeFrameView, rowsCount, generateEmptyChartDateRange, computeNewDateRange, setChartDateRange]);

  // Add effect for scrolling to the earliest Gantt bar
  useEffect(() => {
    if (
      dateRangeInitialized &&
      chartDateRange.length > 0 &&
      rowsCount > 0 &&
      timelinePanelRef.current &&
      !initialScrollPerformed
    ) {
      // Small delay to ensure DOM is fully rendered
      const timeoutId = setTimeout(() => {
        // Calculate day width based on current view and zoom
        const dayWidth = getDayWidth();

        // Get reconstructed rows only when needed for scrolling
        const rows = getAllRows();

        // Scroll to the earliest bar with a small left padding (80px)
        scrollToEarliestBar(timelinePanelRef, rows, chartDateRange, dayWidth, 80);

        // Mark initial scroll as performed
        setInitialScrollPerformed(true);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [dateRangeInitialized, chartDateRange, rowsCount, getAllRows, initialScrollPerformed, getDayWidth]);

  // Safe timeline panel drag handler
  const handleTimelinePanelMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Don't initiate timeline dragging if we clicked on a gantt bar or resizer
      if ((e.target as HTMLElement).closest('.gantt-bar') || (e.target as HTMLElement).closest('.gantt-bar-resize-handle')) {
        console.log('Ignoring mousedown on gantt bar or resizer');
        return;
      }

      const container = timelinePanelRef.current;
      if (container) {
        startTimelineDrag({
          startX: e.pageX - container.offsetLeft,
          scrollLeft: container.scrollLeft,
        });
        container.style.cursor = 'grabbing';
      } else {
        console.log('No valid timelinePanelRef for drag');
      }
    },
    [startTimelineDrag, timelinePanelRef],
  );

  // If still loading or date range not initialized, show loading state
  if (!dateRangeInitialized || chartDateRange.length === 0) {
    console.log('Loading date range or chart data...');
    console.log('Date range initialized:', dateRangeInitialized);
    console.log('Chart date range:', chartDateRange);
    return <div>Loading timeline...</div>;
  }

  return (
    <div
      ref={timelinePanelRef}
      onMouseDown={handleTimelinePanelMouseDown}
      className='gnatt-timeline-panel'
      style={{
        cursor: interactionState.mode === 'timelineDragging' ? 'grabbing' : 'grab',
        zIndex: 1,
      }}>
      <TimeAxisPrimary />
      <TimeAxisSecondary />
      <GanttBarPanel />
    </div>
  );
};

export default React.memo(GanttChartTimelinePanel);
