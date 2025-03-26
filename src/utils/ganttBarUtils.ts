import { DateRangeType, YearDataType } from '../types/dateRangeType';
import { Row } from '../types/row';

// Calculate the gantt bar position from the initial starting point 0 pixel
export const calculateGanttBarPositionFromInitialStartingPoint = (start: Date | string, firstDate: YearDataType): number => {
  const startDate = new Date(start);
  const chartStartPositionDate = new Date(firstDate.year, firstDate.months[0].month);

  return Math.floor((startDate.getTime() - chartStartPositionDate.getTime()) / (1000 * 60 * 60 * 24));
};

// Calculate the row duration by comparing the start and end date
export const calculateDurationBetweenDate = (start: Date | string, end: Date | string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

// Calculate the total day in the chart date range
export const getTotalDayInChartDateRange = (chartDateRange: DateRangeType) => {
  let totalDayInChart = 0;
  chartDateRange.map(year => year.months.map(month => (totalDayInChart = month.days + totalDayInChart)));

  return totalDayInChart;
};

// snap to grid based on the day width unit
export const snapToGridValuePosition = (currentGanttBarLeftPosition: string, dayWidthUnit: number) => {
  // amount of pixel
  const gridInterval = dayWidthUnit;
  // Get the current position after dragging
  const selectedGanttBarPosition = parseInt(currentGanttBarLeftPosition || '0', 10);
  // Snap position to the nearest grid interval
  const snapToGridPosition = Math.round(selectedGanttBarPosition / gridInterval) * gridInterval;

  return snapToGridPosition;
};

// Calculate the new date based on moved pixel
// it calculate how many pixel it move by movedPixel/dayWidthUnit and calculate the new date based on the moved pixel
export const calculateNewDateBasedOnMovedPixel = (currentDate: string, movedPixels: number, dayWidthUnit: number): string => {
  const daysMoved = Math.round(movedPixels / dayWidthUnit);
  const date = new Date(currentDate);
  date.setDate(date.getDate() + daysMoved); // Add or subtract days

  return date.toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
};

/**
 * Finds the earliest date from all rows and their children
 * @param rows Array of row data
 * @returns The earliest date found
 */
export const findEarliestDate = (rows: Row[]): Date | null => {
  if (!rows || rows.length === 0) return null;

  let earliestDate: Date | null = null;

  const processRow = (row: Row) => {
    const startDate = new Date(row.start);

    if (!earliestDate || startDate < earliestDate) {
      earliestDate = startDate;
    }

    // Process children recursively
    if (row.children && row.children.length > 0) {
      row.children.forEach(processRow);
    }
  };

  // Process all rows
  rows.forEach(processRow);

  return earliestDate;
};

/**
 * Calculates the scroll position for the earliest Gantt bar
 * @param earliestDate The earliest date to scroll to
 * @param chartDateRange The current chart date range
 * @param dayWidth The width of a day in pixels
 * @param padding Optional left padding in pixels
 * @returns The scroll position in pixels
 */
export const calculateScrollPositionForDate = (
  earliestDate: Date,
  chartDateRange: DateRangeType,
  dayWidth: number,
  padding: number = 0,
): number => {
  if (!chartDateRange || chartDateRange.length === 0) return 0;

  // Calculate days from chart start to earliest date
  const chartStartDate = new Date(chartDateRange[0].year, chartDateRange[0].months[0].month, 1);
  const daysFromStart = Math.floor((earliestDate.getTime() - chartStartDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate position in pixels and apply padding
  return Math.max(0, daysFromStart * dayWidth - padding);
};

/**
 * Scrolls the timeline panel to the earliest Gantt bar
 * @param timelinePanelRef Reference to the timeline panel element
 * @param rows The row data
 * @param chartDateRange The current chart date range
 * @param dayWidth The width of a day in pixels
 * @param leftPadding Optional left padding in pixels (default: 50)
 */
export const scrollToEarliestBar = (
  timelinePanelRef: React.RefObject<HTMLDivElement> | { current: HTMLDivElement | null },
  rows: Row[],
  chartDateRange: DateRangeType,
  dayWidth: number,
  leftPadding: number = 50,
): void => {
  // Return if missing required parameters
  if (!timelinePanelRef?.current || !rows || rows.length === 0 || !chartDateRange || chartDateRange.length === 0) {
    return;
  }

  const earliestDate = findEarliestDate(rows);
  if (!earliestDate) return;

  // Calculate the scroll position
  const scrollPosition = calculateScrollPositionForDate(earliestDate, chartDateRange, dayWidth, leftPadding);

  // Apply smooth scrolling
  timelinePanelRef.current.scrollTo({
    left: scrollPosition,
    behavior: 'smooth',
  });
};
