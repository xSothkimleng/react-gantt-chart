import { DateRangeType, YearDataType } from '../types/dateRangeType';

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
