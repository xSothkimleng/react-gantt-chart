import { useUIStore } from '../stores/useUIStore';
import { useConfigStore } from '../stores/useConfigStore';
import { calculateGanttBarPositionFromInitialStartingPoint } from './ganttBarUtils';
import { Row } from '../types/row';

/**
 * Scrolls the timeline panel to a specific Gantt bar
 * @param row - The row data containing start date and other information
 * @param options - Optional configuration for scrolling behavior
 * @param options.offset - Horizontal offset in pixels (default: 50)
 * @param options.behavior - Scroll behavior: 'smooth' | 'instant' | 'auto' (default: 'smooth')
 * @returns Promise<boolean> - Returns true if scroll was successful, false otherwise
 */
export const scrollToGanttBar = async (
  row: Row,
  options: {
    offset?: number;
    behavior?: ScrollBehavior;
  } = {},
): Promise<boolean> => {
  const { offset = 50, behavior = 'smooth' } = options;

  try {
    // Get the current state from stores
    const uiStore = useUIStore.getState();
    const configStore = useConfigStore.getState();

    const { timelinePanelRef } = uiStore;
    const { chartTimeFrameView, zoomWidth, chartDateRange } = configStore;

    // Check if timeline panel ref exists
    if (!timelinePanelRef?.current) {
      console.warn('Timeline panel reference not found. Make sure the Gantt chart is properly initialized.');
      return false;
    }

    // Check if chart date range is available
    if (!chartDateRange || chartDateRange.length === 0) {
      console.warn('Chart date range not available. Make sure the Gantt chart data is loaded.');
      return false;
    }

    // Calculate the day width unit
    const dayWidthUnit = chartTimeFrameView.dayWidthUnit + zoomWidth;

    // Calculate the position of the Gantt bar
    const positionLeft = calculateGanttBarPositionFromInitialStartingPoint(row.start, chartDateRange[0]) * dayWidthUnit;

    // Apply scrolling with the specified offset
    timelinePanelRef.current.scrollTo({
      left: Math.max(0, positionLeft - offset),
      behavior,
    });

    console.log(`Scrolled to Gantt bar for row: ${row.name}`);
    return true;
  } catch (error) {
    console.error('Error while scrolling to Gantt bar:', error);
    return false;
  }
};

/**
 * Scrolls to a specific date on the timeline
 * @param date - The target date to scroll to
 * @param options - Optional configuration for scrolling behavior
 * @param options.offset - Horizontal offset in pixels (default: 50)
 * @param options.behavior - Scroll behavior: 'smooth' | 'instant' | 'auto' (default: 'smooth')
 * @returns Promise<boolean> - Returns true if scroll was successful, false otherwise
 */
export const scrollToDate = async (
  date: Date | string,
  options: {
    offset?: number;
    behavior?: ScrollBehavior;
  } = {},
): Promise<boolean> => {
  const { offset = 50, behavior = 'smooth' } = options;

  try {
    // Get the current state from stores
    const uiStore = useUIStore.getState();
    const configStore = useConfigStore.getState();

    const { timelinePanelRef } = uiStore;
    const { chartTimeFrameView, zoomWidth, chartDateRange } = configStore;

    // Check if timeline panel ref exists
    if (!timelinePanelRef?.current) {
      console.warn('Timeline panel reference not found. Make sure the Gantt chart is properly initialized.');
      return false;
    }

    // Check if chart date range is available
    if (!chartDateRange || chartDateRange.length === 0) {
      console.warn('Chart date range not available. Make sure the Gantt chart data is loaded.');
      return false;
    }

    // Calculate the day width unit
    const dayWidthUnit = chartTimeFrameView.dayWidthUnit + zoomWidth;

    // Calculate the position for the target date
    const positionLeft = calculateGanttBarPositionFromInitialStartingPoint(date, chartDateRange[0]) * dayWidthUnit;

    // Apply scrolling with the specified offset
    timelinePanelRef.current.scrollTo({
      left: Math.max(0, positionLeft - offset),
      behavior,
    });

    const targetDate = new Date(date);
    console.log(`Scrolled to date: ${targetDate.toLocaleDateString()}`);
    return true;
  } catch (error) {
    console.error('Error while scrolling to date:', error);
    return false;
  }
};

/**
 * Scrolls to today's date on the timeline
 * @param options - Optional configuration for scrolling behavior
 * @param options.offset - Horizontal offset in pixels (default: 50)
 * @param options.behavior - Scroll behavior: 'smooth' | 'instant' | 'auto' (default: 'smooth')
 * @returns Promise<boolean> - Returns true if scroll was successful, false otherwise
 */
export const scrollToToday = async (
  options: {
    offset?: number;
    behavior?: ScrollBehavior;
  } = {},
): Promise<boolean> => {
  return scrollToDate(new Date(), options);
};

/**
 * Gets the current scroll position of the timeline panel
 * @returns Object containing scroll information or null if not available
 */
export const getTimelineScrollPosition = (): {
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
} | null => {
  try {
    const uiStore = useUIStore.getState();
    const { timelinePanelRef } = uiStore;

    if (!timelinePanelRef?.current) {
      return null;
    }

    const element = timelinePanelRef.current;
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
    };
  } catch (error) {
    console.error('Error getting timeline scroll position:', error);
    return null;
  }
};
