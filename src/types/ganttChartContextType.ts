import { Column } from './column';
import { Row } from './row';

export interface GanttChartContextType {
  // Props passed from parent component
  columnSetting?: Column;
  getSelectedRow?: (row: Row) => void;
  ButtonContainer?: React.FC;

  // Refs that still need to be shared across components
  timelinePanelRef: React.RefObject<HTMLDivElement>;
  leftBoundary: React.MutableRefObject<number>;
  rightBoundary: React.MutableRefObject<number>;
  isChartBorderReached: React.MutableRefObject<boolean>;
  previousContainerScrollLeftPosition: React.MutableRefObject<number>;
}

export type InteractionState =
  | { mode: 'idle' }
  | { mode: 'timelineDragging'; startX: number; scrollLeft: number }
  | { mode: 'barDragging'; barId: string; startX: number; startLeft: number; rowData: Row }
  | {
      mode: 'barResizing';
      barId: string;
      edge: 'left' | 'right';
      startX: number;
      startWidth: number;
      startLeft: number;
      rowData: Row;
    };
