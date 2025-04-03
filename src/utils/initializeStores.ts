// src/utils/initializeStores.ts
import { Column } from '../types/column';
import { Row } from '../types/row';
import { useGanttChartStore } from '../stores/useGanttChartStore';
import { useInteractionStore } from '../stores/useInteractionStore';
import { useUIStore } from '../stores/useUIStore';

// Create auto-scroll ref value correctly typed
const autoScrollRefValue = { current: null as number | null };

interface InitializeStoresProps {
  rows: Row[];
  columns?: Column;
  getSelectedRow?: (row: Row) => void;
  ButtonContainer?: React.FC;
}

export const initializeStores = ({ rows, columns, getSelectedRow, ButtonContainer }: InitializeStoresProps) => {
  useUIStore.setState({
    activeDataIndex: null,
    timelinePanelRef: null,
    isTimelinePanelRefSet: false,
  });

  useInteractionStore.setState({
    interactionState: { mode: 'idle' },
    autoScrollRef: autoScrollRefValue,
    leftBoundary: 0,
    rightBoundary: 0,
    isChartBorderReached: false,
    previousContainerScrollLeftPosition: 0,
  });

  useGanttChartStore.setState({
    isLoading: true,
    columns: columns || ({} as Column),
    rows: rows || [],
    collapsedItems: new Set<string>(),
    ButtonContainer,
    externalGetSelectedRow: getSelectedRow,
    chartDateRange: [], // Will be populated by components
    isChartBorderReached: false,
    zoomWidth: 0,
  });

  useGanttChartStore.setState({ isLoading: false });
};
