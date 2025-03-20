export const progressFormatter = (
  current?: number,
  max?: number,
  options?: {
    comma?: boolean;
    decimal?: number;
    prefix?: string;
    suffix?: string;
  },
  customFormatter?: (c: number, m: number) => string,
): string => {
  // Ensure values are not undefined/null
  const safeCurrent = current ?? 0;
  const safeMax = max ?? 0;

  // If customFormatter is provided, use it
  if (customFormatter) {
    return `${customFormatter(safeCurrent, safeMax)}`;
  }

  // Default formatting options
  const { comma = false, decimal, prefix = '', suffix = '' } = options || {};

  // Format values
  const formatNumber = (num: number) => {
    let formatted = decimal !== undefined ? num.toFixed(decimal) : num.toString();
    if (comma) {
      formatted = Number(formatted).toLocaleString();
    }
    return `${prefix}${formatted}${suffix}`;
  };

  return ` : ${formatNumber(safeCurrent)} / ${formatNumber(safeMax)}`;
};
