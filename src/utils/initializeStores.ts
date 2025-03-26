// src/utils/initializeStores.ts
import { Column } from '../types/column';
import { Row } from '../types/row';
import { useGanttChartStore } from '../stores/GanttChartStore';
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

/**
 * Initialize all Zustand stores with the provided props
 * This function must be called in a useEffect, not directly in render
 */
export const initializeStores = ({
  rows,
  columns,

  getSelectedRow,
  ButtonContainer,
}: InitializeStoresProps) => {
  // First set up the UI store
  // (Needs to be initialized first since other stores might depend on it)
  useUIStore.setState({
    activeDataIndex: null,
    timelinePanelRef: null,
    isTimelinePanelRefSet: false,
  });

  // Set up the interaction store to its initial state
  useInteractionStore.setState({
    interactionState: { mode: 'idle' },
    autoScrollRef: autoScrollRefValue,
    leftBoundary: 0,
    rightBoundary: 0,
    isChartBorderReached: false,
    previousContainerScrollLeftPosition: 0,
  });

  // Set up the main Gantt chart store
  // Do not use setTimeout or any async operations here to prevent race conditions
  // Instead, make sure this function is called in a useEffect hook
  useGanttChartStore.setState({
    isLoading: true, // Start with loading to prevent premature rendering
    columns: columns || ({} as Column),
    rows: rows || [],
    collapsedItems: new Set<string>(),
    ButtonContainer,
    externalGetSelectedRow: getSelectedRow,
    chartDateRange: [], // Will be populated by components
    isChartBorderReached: false,
    zoomWidth: 0,
  });

  // Do a follow-up state change to set loading to false - immediate but separate
  useGanttChartStore.setState({ isLoading: false });
};
