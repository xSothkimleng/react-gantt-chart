import { boundaryExpansion } from '../constants/boundaryExpansion';
import { DateRangeType, MonthDataType } from '../types/dateRangeType';

export const adjustStartDate = (startDate: Date): Date => {
  const adjustedDate = new Date(startDate);
  // Subtract 12 months from the start date
  // adjust this to expand the chart on the left side
  adjustedDate.setMonth(adjustedDate.getMonth() - boundaryExpansion.expandAmountInMonth);
  adjustedDate.setDate(1);
  return adjustedDate;
};

export const adjustEndDate = (endDate: Date): Date => {
  const adjustedDate = new Date(endDate);
  // Add 12 months to the end date
  // same here, adjust this to expand the chart on the right side
  adjustedDate.setMonth(adjustedDate.getMonth() + boundaryExpansion.expandAmountInMonth);
  adjustedDate.setDate(0);
  return adjustedDate;
};

export const initializeDateRange = (startDate: Date, endDate: Date): DateRangeType => {
  const dateRange: DateRangeType = [];

  // Adjust startDate and endDate using helper functions
  const adjustedStartDate = adjustStartDate(startDate);
  const adjustedEndDate = adjustEndDate(endDate);

  // Calculate the month difference between adjustedStartDate and adjustedEndDate
  const startMonth = adjustedStartDate.getFullYear() * 12 + adjustedStartDate.getMonth();
  const endMonth = adjustedEndDate.getFullYear() * 12 + adjustedEndDate.getMonth();
  const monthDifference = endMonth - startMonth + 1;

  // If less than 24 months, extend adjustedEndDate to cover 24 months
  if (monthDifference < 24) {
    const extraMonthsNeeded = 24 - monthDifference;
    adjustedEndDate.setMonth(adjustedEndDate.getMonth() + extraMonthsNeeded);
  }

  const current = new Date(adjustedStartDate);

  while (current <= adjustedEndDate) {
    const currentYear = current.getFullYear();
    const months: MonthDataType[] = [];
    let totalDays = 0;

    // Loop through each month of the current year
    while (current.getFullYear() === currentYear && current <= adjustedEndDate) {
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

  return dateRange;
};
