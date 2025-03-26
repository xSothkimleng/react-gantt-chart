import { useEffect, useRef } from 'react';
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
  const chartTimeFrameView = useGanttChartStore(state => state.chartTimeFrameView);
  const zoomWidth = useGanttChartStore(state => state.zoomWidth);
  const setPreviousContainerScrollLeftPosition = useInteractionStore(state => state.setPreviousContainerScrollLeftPosition);

  // Check if timeline panel ref is available in the UI store
  const timelinePanelRef = useUIStore(state => state.timelinePanelRef);

  // Store the last day width to avoid expensive recalculations
  const dayWidth = useRef(chartTimeFrameView.dayWidthUnit + zoomWidth);

  // Flag to track if event listeners have been attached
  const listenersAttached = useRef(false);

  // Store refs to handler functions to ensure consistent cleanup
  const handlersRef = useRef({
    mouseMoveHandler: null as ((e: MouseEvent) => void) | null,
    mouseUpHandler: null as ((e: MouseEvent) => void) | null,
  });

  // Update stored day width when chartTimeFrameView or zoomWidth changes
  useEffect(() => {
    dayWidth.current = chartTimeFrameView.dayWidthUnit + zoomWidth;
  }, [chartTimeFrameView, zoomWidth]);

  /**
   * Handle automatic scrolling when dragging near the edge of the container
   */
  const handleAutoScroll = (e: MouseEvent) => {
    if (interactionState.mode === 'idle' || !timelinePanelRef?.current) return;

    const container = timelinePanelRef.current;
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
      const doAutoScroll = () => {
        if (!timelinePanelRef?.current) return;

        if (isNearRightEdge) {
          timelinePanelRef.current.scrollLeft += scrollSpeed;

          // Also move the element if we're dragging or resizing
          if (interactionState.mode === 'barDragging') {
            const barElement = document.querySelector(`[data-bar-id="${interactionState.barId}"]`) as HTMLElement;
            if (barElement) {
              const currentLeft = parseInt(barElement.style.left || '0');
              barElement.style.left = `${currentLeft + scrollSpeed}px`;
            }
          } else if (interactionState.mode === 'barResizing' && interactionState.edge === 'right') {
            const barElement = document.querySelector(`[data-bar-id="${interactionState.barId}"]`) as HTMLElement;
            if (barElement) {
              const currentWidth = parseInt(barElement.style.width || '0');
              barElement.style.width = `${currentWidth + scrollSpeed}px`;
            }
          }
        } else if (isNearLeftEdge) {
          timelinePanelRef.current.scrollLeft -= scrollSpeed;

          // Also move the element if we're dragging or resizing
          if (interactionState.mode === 'barDragging') {
            const barElement = document.querySelector(`[data-bar-id="${interactionState.barId}"]`) as HTMLElement;
            if (barElement) {
              const currentLeft = parseInt(barElement.style.left || '0');
              barElement.style.left = `${currentLeft - scrollSpeed}px`;
            }
          } else if (interactionState.mode === 'barResizing' && interactionState.edge === 'left') {
            const barElement = document.querySelector(`[data-bar-id="${interactionState.barId}"]`) as HTMLElement;
            if (barElement) {
              const currentLeft = parseInt(barElement.style.left || '0');
              const currentWidth = parseInt(barElement.style.width || '0');
              barElement.style.left = `${currentLeft - scrollSpeed}px`;
              barElement.style.width = `${currentWidth + scrollSpeed}px`;
            }
          }
        }

        // Continue auto-scrolling
        if (autoScrollRef) {
          autoScrollRef.current = requestAnimationFrame(doAutoScroll);
        }
      };

      autoScrollRef.current = requestAnimationFrame(doAutoScroll);
    }
  };

  // Cleanup function to handle all listener removal and animation cancellation
  const cleanupListeners = () => {
    // Remove event listeners if they were attached
    if (listenersAttached.current && handlersRef.current.mouseMoveHandler && handlersRef.current.mouseUpHandler) {
      document.removeEventListener('mousemove', handlersRef.current.mouseMoveHandler);
      document.removeEventListener('mouseup', handlersRef.current.mouseUpHandler);
      listenersAttached.current = false;
    }

    // Cancel any ongoing auto-scroll
    if (autoScrollRef?.current) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  // This effect manages all interaction event handlers
  useEffect(() => {
    // Don't proceed if we're in idle mode or timeline panel ref isn't set
    if (interactionState.mode === 'idle' || !timelinePanelRef) {
      cleanupListeners();
      return;
    }

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
          const scroll = interactionState.startX - x;
          timelinePanelRef.current.scrollLeft = interactionState.scrollLeft + scroll;
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
      // Make a copy of the current state since we'll reset it before processing
      const currentMode = interactionState.mode;
      const currentBarId = interactionState.mode !== 'timelineDragging' ? interactionState.barId : '';
      const currentStartLeft = interactionState.mode === 'barDragging' ? interactionState.startLeft : 0;
      const currentStartWidth = interactionState.mode === 'barResizing' ? interactionState.startWidth : 0;
      const currentEdge = interactionState.mode === 'barResizing' ? interactionState.edge : undefined;
      const currentRowData = interactionState.mode !== 'timelineDragging' ? interactionState.rowData : undefined;

      // Reset to idle state immediately to prevent re-renders during updates
      setInteractionState({ mode: 'idle' });

      try {
        // Finalize the interaction
        switch (currentMode) {
          case 'timelineDragging': {
            if (timelinePanelRef?.current) {
              timelinePanelRef.current.style.cursor = 'grab';
              setPreviousContainerScrollLeftPosition(timelinePanelRef.current.scrollLeft);
            }
            break;
          }

          case 'barDragging': {
            const barElement = document.querySelector(`[data-bar-id="${currentBarId}"]`) as HTMLElement;
            if (!barElement || !currentRowData) break;

            // Snap to grid
            const newLeft = snapToGridValuePosition(barElement.style.left || '0', dayWidth.current);
            barElement.style.left = `${newLeft}px`;

            // Update data
            const daysMoved = Math.round((newLeft - currentStartLeft) / dayWidth.current);

            if (daysMoved !== 0) {
              updateRow(currentBarId, rowItem => {
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
            const barElement = document.querySelector(`[data-bar-id="${currentBarId}"]`) as HTMLElement;
            if (!barElement || !currentEdge || !currentRowData) break;

            if (currentEdge === 'left') {
              // Snap left edge to grid
              const newLeft = snapToGridValuePosition(barElement.style.left || '0', dayWidth.current);
              const newWidth = parseInt(barElement.style.width || '0') + (parseInt(barElement.style.left || '0') - newLeft);
              barElement.style.left = `${newLeft}px`;
              barElement.style.width = `${newWidth}px`;

              // Update start date
              const daysMoved = Math.round((newLeft - currentStartLeft) / dayWidth.current);

              if (daysMoved !== 0) {
                updateRow(currentBarId, rowItem => {
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
              const gridInterval = dayWidth.current;
              const newWidth = Math.round(parseInt(barElement.style.width || '0') / gridInterval) * gridInterval;
              barElement.style.width = `${newWidth}px`;

              // Update end date
              const daysChanged = Math.round((newWidth - currentStartWidth) / gridInterval);

              if (daysChanged !== 0) {
                updateRow(currentBarId, rowItem => {
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
      } catch (error) {
        console.error('Error in interaction handler:', error);
      }

      // Cleanup regardless of success or failure
      cleanupListeners();
    };

    // Store handlers in the ref for consistent cleanup
    handlersRef.current.mouseMoveHandler = handleMouseMove;
    handlersRef.current.mouseUpHandler = handleMouseUp;

    // Add event listeners if not already attached
    if (!listenersAttached.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      listenersAttached.current = true;
    }

    // Clean up on unmount
    return cleanupListeners;
  }, [interactionState, setInteractionState, updateRow, timelinePanelRef, setPreviousContainerScrollLeftPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanupListeners;
  }, []);

  // Return any methods that might be needed by components
  return {};
};
