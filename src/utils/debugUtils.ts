// src/utils/debugUtils.ts
import { useRowsStore } from '../stores/useRowsStore';
import { useConfigStore } from '../stores/useConfigStore';
import { useInteractionStore } from '../stores/useInteractionStore';
import { useUIStore } from '../stores/useUIStore';

export function logInteractionState() {
  const rowsStore = useRowsStore.getState();
  const configStore = useConfigStore.getState();
  const interactionStore = useInteractionStore.getState();
  const uiStore = useUIStore.getState();

  console.log('===== INTERACTION STATE DEBUG =====');
  console.log('Interaction Mode:', interactionStore.interactionState.mode);
  console.log('Timeline Panel Ref Exists:', !!uiStore.timelinePanelRef?.current);
  console.log('Current Zoom Width:', configStore.zoomWidth);
  console.log('Chart Date Range Length:', configStore.chartDateRange.length);
  console.log('Rows Count:', rowsStore.rows.length);
  console.log('===================================');
}
