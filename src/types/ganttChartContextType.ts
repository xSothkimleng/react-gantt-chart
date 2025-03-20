import { Column } from './column';
import { DateRangeType } from './dateRangeType';
import { Row } from './row';
import { TimeFrameSettingType } from './timeFrameSettingType';

export interface GanttChartContextType {
  allRow: Row[];
  setAllRow: React.Dispatch<React.SetStateAction<Row[]>>;
  columnSetting: Column | undefined;
  setColumnSetting: React.Dispatch<React.SetStateAction<Column | undefined>>;
  collapsedItems: Set<string>;
  toggleCollapse: (itemId: string) => void;
  isChartBorderReached: React.MutableRefObject<boolean>;
  isReachedRightSideBorder: React.MutableRefObject<boolean>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  chartDateRange: DateRangeType;
  setChartDateRange: React.Dispatch<React.SetStateAction<DateRangeType>>;
  chartTimeFrameView: TimeFrameSettingType;
  setChartTimeFrameView: React.Dispatch<React.SetStateAction<TimeFrameSettingType>>;
  previousContainerScrollLeftPosition: React.MutableRefObject<number>;
  activeDataIndex: number | null;
  setActiveDataIndex: React.Dispatch<React.SetStateAction<number | null>>;
  timelinePanelRef: React.RefObject<HTMLDivElement>;
  getSelectedRow?: (row: Row) => void;
  ButtonContainer?: React.FC;
  leftBoundary: React.MutableRefObject<number>;
  rightBoundary: React.MutableRefObject<number>;
  // event state
  interactionState: InteractionState;
  setInteractionState: React.Dispatch<React.SetStateAction<InteractionState>>;
  autoScrollRef: React.MutableRefObject<number | null>;
  // zoom state
  zoomIn: () => void;
  zoomOut: () => void;
  zoomWidth: number;
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
