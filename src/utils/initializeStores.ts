// src/utils/initializeStores.ts
import { Column } from '../types/column';
import { Row } from '../types/row';
import { useRowsStore } from '../stores/useRowsStore';
import { useConfigStore } from '../stores/useConfigStore';
import { useInteractionStore } from '../stores/useInteractionStore';
import { useUIStore } from '../stores/useUIStore';

interface InitializeStoresProps {
  rows: Row[];
  columns?: Column;
  getSelectedRow?: (row: Row) => void;
  ButtonContainer?: React.FC;
}

export const initializeStores = ({ rows, columns, getSelectedRow, ButtonContainer }: InitializeStoresProps) => {
  // Initialize UI Store
  useUIStore.setState({
    timelinePanelRef: null,
    previousScrollPosition: 0,
    selectedRowId: null,
    externalGetSelectedRow: getSelectedRow,
    ButtonContainer,
  });

  // Initialize Interaction Store
  useInteractionStore.setState({
    interactionState: { mode: 'idle' },
    leftBoundary: 0,
    rightBoundary: 0,
    isChartBorderReached: false,
  });

  // Initialize Config Store
  useConfigStore.setState({
    columns: columns || ({} as Column),
    chartDateRange: [],
    isLoading: true,
  });

  // Initialize Rows Store
  useRowsStore.setState({
    collapsedItems: new Set<string>(),
    rows: [],
  });

  useRowsStore.getState().setRows(rows || []);

  // Set loading to false after initialization
  useConfigStore.setState({ isLoading: false });
};
