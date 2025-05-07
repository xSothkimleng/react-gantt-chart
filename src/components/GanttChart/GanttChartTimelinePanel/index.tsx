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
  // Get rows from rowsStore
  const rows = useRowsStore(state => state.memoizedRows());
  const isRowsReady = useRowsStore(state => state.isRowsReady);

  // Get chart configuration from configStore
  const chartTimeFrameView = useConfigStore(state => state.chartTimeFrameView);
  const chartDateRange = useConfigStore(useShallow(state => state.chartDateRange));
  const setChartDateRange = useConfigStore(state => state.setChartDateRange);
  const setIsLoading = useConfigStore(state => state.setIsLoading);
  const getDayWidth = useConfigStore(state => state.getDayWidth);

  // Get interaction state
  const isChartBorderReached = useInteractionStore(state => state.isChartBorderReached);
  const setIsChartBorderReached = useInteractionStore(state => state.setIsChartBorderReached);
  const interactionState = useInteractionStore(state => state.interactionState);
  const startTimelineDrag = useInteractionStore(state => state.startTimelineDrag);

  // Get UI elements and programmatic scroll flag
  const setTimelinePanelRef = useUIStore(state => state.setTimelinePanelRef);
  const dataPanelRef = useUIStore(state => state.dataPanelRef);
  const globalTimelinePanelRef = useUIStore(state => state.timelinePanelRef);
  const isProgrammaticScroll = useUIStore(state => state.isProgrammaticScroll);
  const setIsProgrammaticScroll = useUIStore(state => state.setIsProgrammaticScroll);

  // State to track if date range has been initialized
  const [dateRangeInitialized, setDateRangeInitialized] = useState(false);
  // Add a state to track if initial scroll has been performed
  const [initialScrollPerformed, setInitialScrollPerformed] = useState(false);
  // Add a ref to track the previous view for view changes
  const previousViewRef = useRef(chartTimeFrameView.name);

  // Create ref for time panel
  const timelinePanelRef = useRef<HTMLDivElement>(null);
  const prevChartDateRange = useRef<DateRangeType>([]);
  const prevTimeFrameView = useRef(chartTimeFrameView);

  // Set the timelinePanelRef in UIStore on component mount
  useEffect(() => {
    setTimelinePanelRef(timelinePanelRef);
  }, [setTimelinePanelRef]);

  // Direct DOM event listener for vertical scrolling
  useEffect(() => {
    const panel = timelinePanelRef.current;
    if (!panel) return;

    const handlePanelScroll = () => {
      // Don't process if we're programmatically scrolling
      if (isProgrammaticScroll) return;

      const currentScrollTop = panel.scrollTop;

      if (dataPanelRef?.current) {
        setIsProgrammaticScroll(true);
        dataPanelRef.current.scrollTop = currentScrollTop;
        setTimeout(() => setIsProgrammaticScroll(false), 50);
      }
    };

    // Use direct DOM event listener instead of React's synthetic events
    panel.addEventListener('scroll', handlePanelScroll);

    return () => {
      panel.removeEventListener('scroll', handlePanelScroll);
    };
  }, [dataPanelRef, isProgrammaticScroll, setIsProgrammaticScroll]);

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
    // console.log('Computing new date range...');
    if (rows.length === 0) {
      const emptyRange = generateEmptyChartDateRange();
      // console.log('No rows found, setting empty date range 1:', emptyRange);
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

    // console.log('Date range result:', dateRangeResult);

    setChartDateRange(dateRangeResult);
    if (prevChartDateRange.current.length === 0) {
      prevChartDateRange.current = dateRangeResult;
    }
  }, [rows, setChartDateRange, generateEmptyChartDateRange]);

  // Improved initialization effect that handles both initial loading and rows changes
  useEffect(() => {
    const handleInitialization = () => {
      // console.log('Initializing date range...');
      setIsLoading(true);

      if (rows.length === 0) {
        const emptyRange = generateEmptyChartDateRange();
        // console.log('No rows found, setting empty date range:', emptyRange);
        setChartDateRange(emptyRange);
      } else {
        computeNewDateRange();
      }

      setDateRangeInitialized(true);
      setIsLoading(false);
    };

    if (isRowsReady) {
      handleInitialization();
    }
  }, [rows, generateEmptyChartDateRange, computeNewDateRange, setChartDateRange, setIsLoading, isRowsReady]);

  // Separate effect for handling border reached
  useEffect(() => {
    if (isChartBorderReached && dateRangeInitialized) {
      // console.log('Chart border reached, expanding range...');
      setIsChartBorderReached(false);
      computeNewDateRange();
    }
  }, [isChartBorderReached, dateRangeInitialized, setIsChartBorderReached, computeNewDateRange]);

  // Handle time frame view changes
  useEffect(() => {
    if (dateRangeInitialized && prevTimeFrameView.current !== chartTimeFrameView) {
      prevTimeFrameView.current = chartTimeFrameView;

      // Don't re-initialize completely, just recompute the date range
      if (rows.length === 0) {
        const emptyRange = generateEmptyChartDateRange();
        // console.log('No rows found, setting empty date range 3:', emptyRange);
        setChartDateRange(emptyRange);
      } else {
        computeNewDateRange();
      }

      // Reset initial scroll flag when view changes to trigger a new scroll
      setInitialScrollPerformed(false);

      // Track that the view has changed
      previousViewRef.current = chartTimeFrameView.name;
    }
  }, [dateRangeInitialized, chartTimeFrameView, rows, generateEmptyChartDateRange, computeNewDateRange, setChartDateRange]);

  // scrolling effect
  useEffect(() => {
    if (dateRangeInitialized && chartDateRange.length > 0 && rows.length > 0 && !initialScrollPerformed) {
      const timeoutId = setTimeout(() => {
        const dayWidth = getDayWidth();

        // console.log('scroll effect', timelinePanelRef.current);
        if (globalTimelinePanelRef == null) {
          setTimelinePanelRef(timelinePanelRef);
          // console.log('Global timelinePanelRef in scroll effect is set');
        }

        scrollToEarliestBar(timelinePanelRef, rows, chartDateRange, dayWidth, 80);

        setInitialScrollPerformed(true);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [
    dateRangeInitialized,
    chartDateRange,
    rows,
    initialScrollPerformed,
    getDayWidth,
    globalTimelinePanelRef,
    setTimelinePanelRef,
  ]);

  // dragging effect
  const handleTimelinePanelMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('.gantt-bar') || (e.target as HTMLElement).closest('.gantt-bar-resize-handle')) {
        console.log('Ignoring mousedown on gantt bar or resizer');
        return;
      }

      if (globalTimelinePanelRef == null) {
        setTimelinePanelRef(timelinePanelRef);
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
    [globalTimelinePanelRef, setTimelinePanelRef, startTimelineDrag],
  );

  if (chartDateRange.length === 0) {
    return <div>Loading timeline...</div>;
  }

  return (
    <div
      ref={timelinePanelRef}
      onMouseDown={handleTimelinePanelMouseDown}
      className='gnatt-timeline-panel'
      style={{
        zIndex: 1,
        cursor: interactionState.mode === 'timelineDragging' ? 'grabbing' : 'grab',
        borderBottom: '1px solid var(--gantt-global-border-color)',
        borderRight: '1px solid var(--gantt-global-border-color)',
        height: '100%',
        overflow: 'auto',
      }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 99 }}>
        <TimeAxisPrimary />
        <TimeAxisSecondary />
      </div>
      <GanttBarPanel />
    </div>
  );
};

export default React.memo(GanttChartTimelinePanel);
