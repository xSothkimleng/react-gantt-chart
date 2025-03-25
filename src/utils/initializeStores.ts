import { timeFrameSetting } from '../constants/timeFrameSetting';
import { TimeFrameSettingType } from '../types/timeFrameSettingType';
import { Column } from '../types/column';
import { Row } from '../types/row';
import { useConfigStore } from '../stores/useConfigStore';
import { useRowsStore } from '../stores/useRowsStore';
import { useUIStore } from '../stores/useUIStore';
import { useInteractionStore } from '../stores/useInteractionStore';

interface InitializeStoresProps {
  rows: Row[];
  columns?: Column;
  defaultView?: TimeFrameSettingType;
  getSelectedRow?: (row: Row) => void;
  ButtonContainer?: React.FC;
  showSidebar?: boolean;
}

/**
 * Initialize all Zustand stores with the provided props
 * This replaces the initialization that was previously done in GanttChartProvider
 */
export const initializeStores = ({
  rows,
  columns,
  defaultView = timeFrameSetting.monthly,
  getSelectedRow,
  ButtonContainer,
  showSidebar = true,
}: InitializeStoresProps) => {
  // Initialize config store
  useConfigStore.setState({
    chartTimeFrameView: defaultView,
    columnSetting: columns,
  });

  // Initialize rows store
  useRowsStore.setState({
    allRows: rows,
    externalGetSelectedRow: getSelectedRow,
    ButtonContainer,
  });

  // Initialize UI store
  useUIStore.setState({
    showSidebar,
    isLoading: false,
    chartDateRange: [],
  });

  // Initialize interaction store
  useInteractionStore.setState({
    interactionState: { mode: 'idle' },
    leftBoundary: 0,
    rightBoundary: 0,
    isChartBorderReached: false,
    previousContainerScrollLeftPosition: 0,
  });
};
