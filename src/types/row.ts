import { progressIndicator } from './progressIndicator';

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
  progressIndicatorLabel?: string;
  [key: string]: unknown;
}
