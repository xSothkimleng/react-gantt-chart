import { progressIndicator, progressIndicatorLabel } from './progressIndicator';

interface DefaultRowSetting {
  id: string | number;
  name: string;
  start: string;
  end: string;
}

export interface Row extends DefaultRowSetting {
  highlight?: boolean;
  children?: Row[];
  currentProgress?: number;
  maxProgress?: number;
  isLocked?: boolean;
  showProgressIndicator?: progressIndicator;
  progressIndicatorLabel?: progressIndicatorLabel;
  progressIndicatorLabelFormatter?: () => string;
  [key: string]: unknown;
}
