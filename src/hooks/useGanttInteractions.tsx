import { useEffect } from 'react';
import { useInteractionStore } from '../stores/useInteractionStore';
import { useUIStore } from '../stores/useUIStore';
import { snapToGridValuePosition } from '../utils/ganttBarUtils';
import { useGanttChartStore } from '../stores/GanttChartStore';

/**
 * Hook that handles all Gantt chart interactions like dragging and resizing
 * This replaces the interaction handling that was previously in GanttChartProvider
 */
export const useGanttInteractions = () => {
  // Get only the state and actions we need from each store
  const interactionState = useInteractionStore(state => state.interactionState);
  const setInteractionState = useInteractionStore(state => state.setInteractionState);
  const autoScrollRef = useInteractionStore(state => state.autoScrollRef);
  const updateRow = useGanttChartStore(state => state.updateRow);
  const timelinePanelRef = useUIStore(state => state.timelinePanelRef);
  const chartTimeFrameView = useGanttChartStore(state => state.chartTimeFrameView);
  const setPreviousContainerScrollLeftPosition = useInteractionStore(state => state.setPreviousContainerScrollLeftPosition);

  /**
   * Handle automatic scrolling when dragging near the edge of the container
   */
  const handleAutoScroll = (e: MouseEvent) => {
    if (interactionState.mode === 'idle' || !timelinePanelRef) return;

    const container = timelinePanelRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const edgeThreshold = 30;
    const scrollSpeed = 15;

    const isNearRightEdge = e.clientX > rect.right - edgeThreshold;
    const isNearLeftEdge = e.clientX < rect.left + edgeThreshold;

    // Cancel existing auto-scroll if we're not near an edge
    if (!isNearRightEdge && !isNearLeftEdge && autoScrollRef?.current) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
      return;
    }

    // Start auto-scrolling if not already started
    if ((isNearRightEdge || isNearLeftEdge) && autoScrollRef && !autoScrollRef.current) {
      autoScrollRef.current = requestAnimationFrame(function autoScroll() {
        if (!timelinePanelRef?.current) return;

        if (isNearRightEdge) {
          timelinePanelRef.current.scrollLeft += scrollSpeed;

          // Also move the element if we're dragging or resizing
          if (interactionState.mode === 'barDragging') {
            const barElement = document.querySelector(`[data-bar-id="${interactionState.barId}"]`) as HTMLElement;
            if (barElement) {
              const currentLeft = parseInt(barElement.style.left);
              barElement.style.left = `${currentLeft + scrollSpeed}px`;
            }
          } else if (interactionState.mode === 'barResizing' && interactionState.edge === 'right') {
            const barElement = document.querySelector(`[data-bar-id="${interactionState.barId}"]`) as HTMLElement;
            if (barElement) {
              const currentWidth = parseInt(barElement.style.width);
              barElement.style.width = `${currentWidth + scrollSpeed}px`;
            }
          }
        } else if (isNearLeftEdge) {
          timelinePanelRef.current.scrollLeft -= scrollSpeed;

          // Also move the element if we're dragging or resizing
          if (interactionState.mode === 'barDragging') {
            const barElement = document.querySelector(`[data-bar-id="${interactionState.barId}"]`) as HTMLElement;
            if (barElement) {
              const currentLeft = parseInt(barElement.style.left);
              barElement.style.left = `${currentLeft - scrollSpeed}px`;
            }
          } else if (interactionState.mode === 'barResizing' && interactionState.edge === 'left') {
            const barElement = document.querySelector(`[data-bar-id="${interactionState.barId}"]`) as HTMLElement;
            if (barElement) {
              const currentLeft = parseInt(barElement.style.left);
              const currentWidth = parseInt(barElement.style.width);
              barElement.style.left = `${currentLeft - scrollSpeed}px`;
              barElement.style.width = `${currentWidth + scrollSpeed}px`;
            }
          }
        }

        // Continue auto-scrolling
        if (autoScrollRef) {
          autoScrollRef.current = requestAnimationFrame(autoScroll);
        }
      });
    }
  };

  // Set up mouse event handlers
  useEffect(() => {
    // Skip event handling if in idle mode
    if (interactionState.mode === 'idle') return;

    /**
     * Handle mouse movement for different interaction modes
     */
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      // Handle auto-scrolling for all interaction modes
      handleAutoScroll(e);

      switch (interactionState.mode) {
        case 'timelineDragging': {
          if (!timelinePanelRef?.current) return;
          const x = e.pageX - timelinePanelRef.current.offsetLeft;
          const scroll = x - interactionState.startX;
          timelinePanelRef.current.scrollLeft = interactionState.scrollLeft - scroll;
          break;
        }

        case 'barDragging': {
          const deltaX = e.clientX - interactionState.startX;
          const newLeft = interactionState.startLeft + deltaX;

          // Find the bar element and update its position
          const barElement = document.querySelector(`[data-bar-id="${interactionState.barId}"]`) as HTMLElement;
          if (barElement) {
            barElement.style.left = `${newLeft}px`;
          }
          break;
        }

        case 'barResizing': {
          const deltaX = e.clientX - interactionState.startX;
          const barElement = document.querySelector(`[data-bar-id="${interactionState.barId}"]`) as HTMLElement;
          if (!barElement) return;

          if (interactionState.edge === 'left') {
            const newLeft = interactionState.startLeft + deltaX;
            const newWidth = interactionState.startWidth - deltaX;

            if (newWidth > 0) {
              barElement.style.left = `${newLeft}px`;
              barElement.style.width = `${newWidth}px`;
            }
          } else {
            const newWidth = interactionState.startWidth + deltaX;

            if (newWidth > 0) {
              barElement.style.width = `${newWidth}px`;
            }
          }
          break;
        }
      }
    };

    /**
     * Handle mouse up to finalize interactions
     */
    const handleMouseUp = () => {
      // Finalize the interaction
      switch (interactionState.mode) {
        case 'timelineDragging': {
          if (timelinePanelRef?.current) {
            timelinePanelRef.current.style.cursor = 'grab';
            setPreviousContainerScrollLeftPosition(timelinePanelRef.current.scrollLeft);
          }
          break;
        }

        case 'barDragging': {
          const barElement = document.querySelector(`[data-bar-id="${interactionState.barId}"]`) as HTMLElement;
          if (!barElement) break;

          // Snap to grid
          const newLeft = snapToGridValuePosition(barElement.style.left, chartTimeFrameView.dayWidthUnit);
          barElement.style.left = `${newLeft}px`;

          // Update data
          const daysMoved = Math.round((newLeft - interactionState.startLeft) / chartTimeFrameView.dayWidthUnit);

          if (daysMoved !== 0) {
            updateRow(interactionState.barId, rowItem => {
              const newStartDate = new Date(rowItem.start);
              newStartDate.setDate(newStartDate.getDate() + daysMoved);

              const newEndDate = new Date(rowItem.end);
              newEndDate.setDate(newEndDate.getDate() + daysMoved);

              return {
                ...rowItem,
                start: newStartDate.toISOString(),
                end: newEndDate.toISOString(),
              };
            });
          }

          if (timelinePanelRef?.current) {
            setPreviousContainerScrollLeftPosition(timelinePanelRef.current.scrollLeft);
          }
          break;
        }

        case 'barResizing': {
          const barElement = document.querySelector(`[data-bar-id="${interactionState.barId}"]`) as HTMLElement;
          if (!barElement) break;

          if (interactionState.edge === 'left') {
            // Snap left edge to grid
            const newLeft = snapToGridValuePosition(barElement.style.left, chartTimeFrameView.dayWidthUnit);
            const newWidth = parseInt(barElement.style.width) + (parseInt(barElement.style.left) - newLeft);
            barElement.style.left = `${newLeft}px`;
            barElement.style.width = `${newWidth}px`;

            // Update start date
            const daysMoved = Math.round((newLeft - interactionState.startLeft) / chartTimeFrameView.dayWidthUnit);

            if (daysMoved !== 0) {
              updateRow(interactionState.barId, rowItem => {
                const newStartDate = new Date(rowItem.start);
                newStartDate.setDate(newStartDate.getDate() + daysMoved);

                return {
                  ...rowItem,
                  start: newStartDate.toISOString(),
                };
              });
            }
          } else {
            // Snap width to grid
            const gridInterval = chartTimeFrameView.dayWidthUnit;
            const newWidth = Math.round(parseInt(barElement.style.width) / gridInterval) * gridInterval;
            barElement.style.width = `${newWidth}px`;

            // Update end date
            const daysChanged = Math.round((newWidth - interactionState.startWidth) / chartTimeFrameView.dayWidthUnit);

            if (daysChanged !== 0) {
              updateRow(interactionState.barId, rowItem => {
                const newEndDate = new Date(rowItem.end);
                newEndDate.setDate(newEndDate.getDate() + daysChanged);

                return {
                  ...rowItem,
                  end: newEndDate.toISOString(),
                };
              });
            }
          }

          if (timelinePanelRef?.current) {
            setPreviousContainerScrollLeftPosition(timelinePanelRef.current.scrollLeft);
          }
          break;
        }
      }

      // Stop auto-scrolling
      if (autoScrollRef?.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }

      // Reset to idle state
      setInteractionState({ mode: 'idle' });
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Clean up
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Ensure auto-scrolling is stopped when unmounting
      if (autoScrollRef?.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    };
  }, [
    interactionState,
    chartTimeFrameView,
    autoScrollRef,
    timelinePanelRef,
    setInteractionState,
    updateRow,
    setPreviousContainerScrollLeftPosition,
  ]);

  // Return any methods that might be needed by components
  return {
    // You can expose any additional methods here if needed
  };
};
