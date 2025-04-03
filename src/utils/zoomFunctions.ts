import { useUIStore } from '../stores/useUIStore';
import { useConfigStore } from '../stores/useConfigStore';

/**
 * Zoom in function that increases the zoom level
 * This is exported for external use
 */
export function zoomIn() {
  const configStore = useConfigStore.getState();
  const uiStore = useUIStore.getState();

  // Get current values
  const { zoomWidth } = configStore;
  const { timelinePanelRef } = uiStore;

  const setPreviousScrollPosition = uiStore.setPreviousScrollPosition;

  // Update zoom width in the store
  const newZoomWidth = zoomWidth + 10;
  useConfigStore.setState({ zoomWidth: newZoomWidth });

  // Handle panel scrolling if ref exists
  if (timelinePanelRef?.current) {
    const container = timelinePanelRef.current;

    // Find the position of the current container's scrollLeft
    const scrollableWidth = Math.max(container.scrollWidth - container.clientWidth, 1);
    const visualRatio = container.scrollLeft / scrollableWidth;

    // Use requestAnimationFrame to ensure DOM updates before we scroll
    requestAnimationFrame(() => {
      // Calculate new scroll position after zoom
      const newScrollableWidth = Math.max(container.scrollWidth - container.clientWidth, 1);
      const newScrollLeft = visualRatio * newScrollableWidth;

      // Apply the new scroll position
      container.scrollLeft = newScrollLeft;
      setPreviousScrollPosition(newScrollLeft);
    });
  }
}

/**
 * Zoom out function that decreases the zoom level
 * This is exported for external use
 */
export function zoomOut() {
  const configStore = useConfigStore.getState();
  const uiStore = useUIStore.getState();

  // Get current values
  const { zoomWidth } = configStore;
  const { timelinePanelRef } = uiStore;
  const setPreviousScrollPosition = uiStore.setPreviousScrollPosition;

  // Update zoom width in the store with minimum limit
  const newZoomWidth = zoomWidth - 10;
  if (newZoomWidth < 0) return;

  useConfigStore.setState({ zoomWidth: newZoomWidth });

  // Handle panel scrolling if ref exists
  if (timelinePanelRef?.current) {
    const container = timelinePanelRef.current;

    // Find the position of the current container's scrollLeft
    const scrollableWidth = Math.max(container.scrollWidth - container.clientWidth, 1);
    const visualRatio = container.scrollLeft / scrollableWidth;

    // Use requestAnimationFrame to ensure DOM updates before we scroll
    requestAnimationFrame(() => {
      // Calculate new scroll position after zoom
      const newScrollableWidth = Math.max(container.scrollWidth - container.clientWidth, 1);
      const newScrollLeft = visualRatio * newScrollableWidth;

      // Apply the new scroll position
      container.scrollLeft = newScrollLeft;
      setPreviousScrollPosition(newScrollLeft);
    });
  }
}
