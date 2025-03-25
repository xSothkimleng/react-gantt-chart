import { useConfigStore } from '../stores/useConfigStore';
import { useUIStore } from '../stores/useUIStore';
import { useRowsStore } from '../stores/useRowsStore';
import { useInteractionStore } from '../stores/useInteractionStore';

/**
 * Composite hook that combines all Gantt stores into a single API
 * This provides a simpler interface for components that need access to multiple stores
 */
export function useGantt() {
  // Get specific values and methods from each store
  const config = useConfigStore(state => ({
    chartTimeFrameView: state.chartTimeFrameView,
    columnSetting: state.columnSetting,
    zoomWidth: state.zoomWidth,
    setChartTimeFrameView: state.setChartTimeFrameView,
    setColumnSetting: state.setColumnSetting,
    zoomIn: state.zoomIn,
    zoomOut: state.zoomOut,
  }));

  const ui = useUIStore(state => ({
    isLoading: state.isLoading,
    chartDateRange: state.chartDateRange,
    collapsedItems: state.collapsedItems,
    showSidebar: state.showSidebar,
    activeDataIndex: state.activeDataIndex,
    setIsLoading: state.setIsLoading,
    setChartDateRange: state.setChartDateRange,
    toggleCollapse: state.toggleCollapse,
    setShowSidebar: state.setShowSidebar,
    setActiveDataIndex: state.setActiveDataIndex,
  }));

  const rowsState = useRowsStore(state => ({
    allRows: state.allRows,
    updateRow: state.updateRow,
    selectRow: state.selectRow,
    setAllRows: state.setAllRows,
    ButtonContainer: state.ButtonContainer,
  }));

  const interaction = useInteractionStore(state => ({
    interactionState: state.interactionState,
    setInteractionState: state.setInteractionState,
    startBarDrag: state.startBarDrag,
    startBarResize: state.startBarResize,
    startTimelineDrag: state.startTimelineDrag,
  }));

  // Return a consolidated API
  return {
    // Config
    chartTimeFrameView: config.chartTimeFrameView,
    columnSetting: config.columnSetting,
    zoomWidth: config.zoomWidth,
    setChartTimeFrameView: config.setChartTimeFrameView,
    setColumnSetting: config.setColumnSetting,
    zoomIn: config.zoomIn,
    zoomOut: config.zoomOut,

    // UI
    isLoading: ui.isLoading,
    chartDateRange: ui.chartDateRange,
    collapsedItems: ui.collapsedItems,
    showSidebar: ui.showSidebar,
    activeDataIndex: ui.activeDataIndex,
    setIsLoading: ui.setIsLoading,
    setChartDateRange: ui.setChartDateRange,
    toggleCollapse: ui.toggleCollapse,
    setShowSidebar: ui.setShowSidebar,
    setActiveDataIndex: ui.setActiveDataIndex,

    // Rows - now using allRows directly instead of denormalized rows
    allRows: rowsState.allRows,
    updateRow: rowsState.updateRow,
    selectRow: rowsState.selectRow,
    setAllRows: rowsState.setAllRows,
    ButtonContainer: rowsState.ButtonContainer,

    // Interaction
    interactionState: interaction.interactionState,
    setInteractionState: interaction.setInteractionState,
    startBarDrag: interaction.startBarDrag,
    startBarResize: interaction.startBarResize,
    startTimelineDrag: interaction.startTimelineDrag,
  };
}
