export interface MonthDataType {
  month: number;
  days: number;
}

export interface YearDataType {
  year: number;
  months: MonthDataType[];
  totalDayAmount: number;
}

export type DateRangeType = YearDataType[];
