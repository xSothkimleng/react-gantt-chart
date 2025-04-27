import { useUIStore } from '../stores/useUIStore';
import { useConfigStore } from '../stores/useConfigStore';

// Track if zoom operation is in progress
let zoomOperationInProgress: boolean = false;
// Track pending zoom operations to batch them
let pendingZoomOperation: number | null = null;
let pendingZoomTimer: NodeJS.Timeout | null = null;

/**
 * Performs the actual zoom operation
 * @param {number} zoomDelta - Amount to change zoom (positive for zoom in, negative for zoom out)
 */
function performZoom(zoomDelta: number): void {
  if (zoomOperationInProgress) {
    // If a zoom is in progress, queue this operation
    if (pendingZoomTimer) clearTimeout(pendingZoomTimer);
    // Update the pending delta (combine with existing if any)
    pendingZoomOperation = (pendingZoomOperation || 0) + zoomDelta;
    pendingZoomTimer = setTimeout(() => {
      const delta = pendingZoomOperation;
      pendingZoomOperation = null;
      performZoom(delta as number);
    }, 100);
    return;
  }

  zoomOperationInProgress = true;

  const configStore = useConfigStore.getState();
  const uiStore = useUIStore.getState();

  // Get current values
  const { zoomWidth } = configStore;
  const { timelinePanelRef } = uiStore;
  const setPreviousScrollPosition = uiStore.setPreviousScrollPosition;

  // Handle panel scrolling if ref exists
  if (timelinePanelRef?.current) {
    const container = timelinePanelRef.current;

    // Store these values before any state updates
    const scrollableWidth = Math.max(container.scrollWidth - container.clientWidth, 1);
    const visualRatio = container.scrollLeft / scrollableWidth;

    // Calculate new zoom width with limits
    const newZoomWidth = Math.max(0, zoomWidth + zoomDelta);

    // Only proceed if there's an actual change
    if (newZoomWidth !== zoomWidth) {
      // Update zoom width in the store
      useConfigStore.setState({ zoomWidth: newZoomWidth });

      // Use a single requestAnimationFrame to reduce repaints
      requestAnimationFrame(() => {
        // Calculate new scroll position after zoom
        const newScrollableWidth = Math.max(container.scrollWidth - container.clientWidth, 1);
        const newScrollLeft = visualRatio * newScrollableWidth;

        // Apply the new scroll position
        container.scrollLeft = newScrollLeft;
        setPreviousScrollPosition(newScrollLeft);

        // Finish operation
        zoomOperationInProgress = false;

        // Check if we have pending operations
        if (pendingZoomOperation !== null) {
          const delta = pendingZoomOperation;
          pendingZoomOperation = null;
          if (pendingZoomTimer) clearTimeout(pendingZoomTimer);
          pendingZoomTimer = null;

          // Small delay to ensure UI can update
          setTimeout(() => performZoom(delta), 16);
        }
      });
    } else {
      // No change needed
      zoomOperationInProgress = false;
    }
  } else {
    console.log('Timeline panel ref not found');
    zoomOperationInProgress = false;
  }
}

/**
 * Zoom in function that increases the zoom level
 * This is exported for external use
 */
export function zoomIn(): void {
  performZoom(10); // Positive delta for zoom in
}

/**
 * Zoom out function that decreases the zoom level
 * This is exported for external use
 */
export function zoomOut(): void {
  performZoom(-10); // Negative delta for zoom out
}
