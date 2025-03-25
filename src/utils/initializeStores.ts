import { timeFrameSetting } from '../constants/timeFrameSetting';
import { TimeFrameSettingType } from '../types/timeFrameSettingType';
import { Column } from '../types/column';
import { Row } from '../types/row';
import { useGanttChartStore } from '../stores/GanttChartStore';
import { useInteractionStore } from '../stores/useInteractionStore';
import { useUIStore } from '../stores/useUIStore';

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
  useGanttChartStore.setState({
    columns: columns,
    rows: rows,
    chartTimeFrameView: defaultView,
    showSidebar: showSidebar,
    ButtonContainer: ButtonContainer,
    externalGetSelectedRow: getSelectedRow,
  });

  useInteractionStore.setState({
    interactionState: { mode: 'idle' },
    leftBoundary: 0,
    rightBoundary: 0,
    isChartBorderReached: false,
    previousContainerScrollLeftPosition: 0,
  });

  useUIStore.setState({
    activeDataIndex: null,
  });
};
