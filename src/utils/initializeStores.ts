import { timeFrameSetting } from '../constants/timeFrameSetting';
import { TimeFrameSettingType } from '../types/timeFrameSettingType';
import { Column } from '../types/column';
import { Row } from '../types/row';
import { useConfigStore } from '../stores/useConfigStore';
import { useRowsStore } from '../stores/useRowsStore';
import { useUIStore } from '../stores/useUIStore';
import { useInteractionStore } from '../stores/useInteractionStore';
import { isEqual } from 'lodash'; // Import isEqual for deep comparison

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
  // Get current state
  const currentConfig = useConfigStore.getState();
  const currentRows = useRowsStore.getState();
  const currentUI = useUIStore.getState();

  // Only update config store if values have changed
  if (currentConfig.chartTimeFrameView !== defaultView || !isEqual(currentConfig.columnSetting, columns)) {
    useConfigStore.setState({
      chartTimeFrameView: defaultView,
      columnSetting: columns,
    });
  }

  // Only update rows store if values have changed
  // Note: We're using a more lenient check for rows since deep equality could be expensive
  // You might want to implement a more sophisticated comparison based on your needs
  if (
    currentRows.allRows !== rows ||
    currentRows.externalGetSelectedRow !== getSelectedRow ||
    currentRows.ButtonContainer !== ButtonContainer
  ) {
    useRowsStore.setState({
      allRows: rows,
      externalGetSelectedRow: getSelectedRow,
      ButtonContainer,
    });
  }

  // Only update UI store if sidebar visibility has changed
  if (currentUI.showSidebar !== showSidebar) {
    useUIStore.setState({
      showSidebar,
    });
  }

  // Initialize interaction store only if needed
  // We don't need to check previous values since these are defaults
  if (useInteractionStore.getState().interactionState.mode !== 'idle') {
    useInteractionStore.setState({
      interactionState: { mode: 'idle' },
      leftBoundary: 0,
      rightBoundary: 0,
      isChartBorderReached: false,
      previousContainerScrollLeftPosition: 0,
    });
  }
};
