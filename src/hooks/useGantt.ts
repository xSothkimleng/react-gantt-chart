// src/hooks/useGantt.ts
import { useConfigStore } from '../stores/useConfigStore';
import { useUIStore } from '../stores/useUIStore';
import { useRowsStore, denormalizeRows } from '../stores/useRowsStore';
import { useInteractionStore } from '../stores/useInteractionStore';

export function useGantt() {
  const config = useConfigStore();
  const ui = useUIStore();
  const rowsState = useRowsStore();
  const interaction = useInteractionStore();

  // Compute derived data
  const allRows = denormalizeRows(rowsState.rowsById, rowsState.rootIds);

  return {
    // Config
    chartTimeFrameView: config.chartTimeFrameView,
    chartDateRange: config.chartDateRange,
    zoomWidth: config.zoomWidth,
    setChartTimeFrameView: config.setChartTimeFrameView,
    setChartDateRange: config.setChartDateRange,
    zoomIn: config.zoomIn,
    zoomOut: config.zoomOut,

    // UI
    isLoading: ui.isLoading,
    collapsedItems: ui.collapsedItems,
    setIsLoading: ui.setIsLoading,
    toggleCollapse: ui.toggleCollapse,

    // Rows
    allRows,
    updateRow: rowsState.updateRow,
    moveRow: rowsState.moveRow,
    resizeRow: rowsState.resizeRow,

    // Interaction
    interactionState: interaction.state,
    setInteractionState: interaction.setInteractionState,
  };
}
