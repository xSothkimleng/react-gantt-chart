import { useGanttChartStore } from '../stores/GanttChartStore';
import { useInteractionStore } from '../stores/useInteractionStore';
import { useUIStore } from '../stores/useUIStore';

export function logInteractionState() {
  const ganttChartStore = useGanttChartStore.getState();
  const interactionStore = useInteractionStore.getState();
  const uiStore = useUIStore.getState();

  console.log('===== INTERACTION STATE DEBUG =====');
  console.log('Interaction Mode:', interactionStore.interactionState.mode);
  console.log('Timeline Panel Ref Exists:', !!uiStore.timelinePanelRef?.current);
  console.log('Current Zoom Width:', ganttChartStore.zoomWidth);
  console.log('Chart Date Range Length:', ganttChartStore.chartDateRange.length);
  console.log('===================================');
}
