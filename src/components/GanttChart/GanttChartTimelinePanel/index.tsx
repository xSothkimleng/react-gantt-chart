import React, { useCallback, useEffect, useRef } from 'react';
import TimeAxisPrimary from './TimeAxis/TimeAxisPrimary';
import TimeAxisSecondary from './TimeAxis/TimeAxisSecondary';
import GanttBarPanel from './GanttBarPanel';
import { DateRangeType, MonthDataType } from '../../../types/dateRangeType';
import { initializeDateRange } from '../../../utils/dateUtils';
import { useUIStore } from '../../../stores/useUIStore';
import { useConfigStore } from '../../../stores/useConfigStore';
import { useRowsStore } from '../../../stores/useRowsStore';
import { useInteractionStore } from '../../../stores/useInteractionStore';
import './styles.css';
import { getTotalDayInChartDateRange } from '../../../utils/ganttBarUtils';

const GanttChartTimelinePanel = () => {
  // Get values and actions from stores
  const { allRows } = useRowsStore(state => ({
    allRows: state.allRows,
  }));

  const { chartTimeFrameView, zoomWidth } = useConfigStore(state => ({
    chartTimeFrameView: state.chartTimeFrameView,
    zoomWidth: state.zoomWidth,
  }));

  const { chartDateRange, setChartDateRange, setIsLoading, timelinePanelRef, setTimelinePanelRef } = useUIStore(state => ({
    chartDateRange: state.chartDateRange,
    isLoading: state.isLoading,
    setChartDateRange: state.setChartDateRange,
    setIsLoading: state.setIsLoading,
    timelinePanelRef: state.timelinePanelRef,
    setTimelinePanelRef: state.setTimelinePanelRef,
  }));

  const {
    startTimelineDrag,
    isChartBorderReached,
    setIsChartBorderReached,
    setPreviousContainerScrollLeftPosition,
    setBoundaries,
    interactionState,
  } = useInteractionStore(state => ({
    startTimelineDrag: state.startTimelineDrag,
    isChartBorderReached: state.isChartBorderReached,
    setIsChartBorderReached: state.setIsChartBorderReached,
    previousContainerScrollLeftPosition: state.previousContainerScrollLeftPosition,
    setPreviousContainerScrollLeftPosition: state.setPreviousContainerScrollLeftPosition,
    leftBoundary: state.leftBoundary,
    rightBoundary: state.rightBoundary,
    setBoundaries: state.setBoundaries,
    interactionState: state.interactionState,
  }));

  // Create local refs if not already provided via store
  const localTimelinePanelRef = useRef<HTMLDivElement | null>(null);
  const prevChartDateRange = useRef<DateRangeType>([]);
  const prevTimeFrameView = useRef(chartTimeFrameView);
  const centerPositionRef = useRef<number | null>(null);

  // Set timelinePanelRef in the store if we're using the local ref
  useEffect(() => {
    if (!timelinePanelRef && localTimelinePanelRef.current) {
      setTimelinePanelRef(localTimelinePanelRef);
    }
  }, [timelinePanelRef, setTimelinePanelRef]);

  // Use either the store's ref or our local ref
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
    const allDates = allRows.flatMap(row => [new Date(row.start), new Date(row.end)]);

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
  }, [allRows, setChartDateRange]);

  const handleInitializeDateRange = () => {
    if (!allRows || allRows.length === 0) {
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
    if ((e.target as HTMLElement).closest('.gantt-bar') || (e.target as HTMLElement).closest('.bar-resizer')) {
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
  }, [allRows, setIsLoading]);

  // Handle time frame view changes
  useEffect(() => {
    if (prevTimeFrameView.current !== chartTimeFrameView) {
      prevTimeFrameView.current = chartTimeFrameView;
      handleInitializeDateRange();
    }
  }, [chartTimeFrameView]);

  // Update boundaries whenever chartDateRange or chartTimeFrameView changes
  useEffect(() => {
    if (chartDateRange.length > 0) {
      // combine default width with zoom width
      const chartWidth = chartTimeFrameView.dayWidthUnit + zoomWidth;

      // Left boundary is a fixed offset from the start
      const newLeftBoundary = chartWidth * 7;

      // Right boundary is based on the total days in the chart
      const totalDays = getTotalDayInChartDateRange(chartDateRange);
      const newRightBoundary = totalDays * chartWidth - chartWidth * 7;

      // Ensure a minimum chart width even at small zoom levels
      const finalRightBoundary = newRightBoundary <= newLeftBoundary ? newLeftBoundary + 100 : newRightBoundary;

      setBoundaries(newLeftBoundary, finalRightBoundary);
    }
  }, [chartDateRange, chartTimeFrameView, zoomWidth, setBoundaries]);

  // scrolling to earliest GanttBar
  useEffect(() => {
    const container = panelRef.current;
    if (!container || chartDateRange.length === 0 || allRows.length === 0) return;

    // When zooming (only dayWidthUnit changes), try to maintain the same center position
    if (
      prevTimeFrameView.current &&
      prevTimeFrameView.current.name === chartTimeFrameView.name &&
      prevTimeFrameView.current.dayWidthUnit !== chartTimeFrameView.dayWidthUnit
    ) {
      // If we have a stored center position, use it to calculate the new scroll position
      if (centerPositionRef.current !== null) {
        const ratio = chartTimeFrameView.dayWidthUnit / prevTimeFrameView.current.dayWidthUnit;
        const newScrollPosition = centerPositionRef.current * ratio - container.clientWidth / 2;
        container.scrollLeft = newScrollPosition;
        setPreviousContainerScrollLeftPosition(container.scrollLeft);
      }
    } else {
      // For view changes or initial load, find the earliest GanttBar
      const earliestGanttBar = allRows.reduce((earliest, current) => {
        return new Date(current.start) < new Date(earliest.start) ? current : earliest;
      }, allRows[0]);

      // Calculate scroll position to the earliest GanttBar
      const chartStartDate = new Date(chartDateRange[0].year, chartDateRange[0].months[0].month);
      const barStartDate = new Date(earliestGanttBar.start);
      const daysFromStart = Math.floor((barStartDate.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24));
      const scrollPosition = daysFromStart * chartTimeFrameView.dayWidthUnit;

      // Scroll to position with slight offset
      container.scrollLeft = Math.max(0, scrollPosition - chartTimeFrameView.dayWidthUnit);
      setPreviousContainerScrollLeftPosition(container.scrollLeft);
    }

    // Store the current timeFrameView for next comparison
    prevTimeFrameView.current = { ...chartTimeFrameView };
  }, [chartTimeFrameView, chartDateRange, allRows, setPreviousContainerScrollLeftPosition]);

  useEffect(() => {
    const container = panelRef.current;
    if (!container) return;

    // Store the center position whenever the user interacts with the timeline
    const handleScroll = () => {
      centerPositionRef.current = container.scrollLeft + container.clientWidth / 2;
    };

    container.addEventListener('scroll', handleScroll);

    // Initial calculation
    centerPositionRef.current = container.scrollLeft + container.clientWidth / 2;

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      ref={panelRef}
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
