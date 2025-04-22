import { useEffect, useRef } from 'react';
import { useInteractionStore } from '../stores/useInteractionStore';
import { useUIStore } from '../stores/useUIStore';
import { snapToGridValuePosition } from '../utils/ganttBarUtils';

import { useRowsStore } from '../stores/useRowsStore';
import { useConfigStore } from '../stores/useConfigStore';

export const useGanttInteractions = () => {
  const interactionState = useInteractionStore(state => state.interactionState);
  const setInteractionState = useInteractionStore(state => state.setInteractionState);
  const autoScrollRef = useInteractionStore(state => state.autoScrollRef);
  const updateRow = useRowsStore(state => state.updateRow);
  const timelinePanelRef = useUIStore(state => state.timelinePanelRef);
  const chartTimeFrameView = useConfigStore(state => state.chartTimeFrameView);
  const zoomWidth = useConfigStore(state => state.zoomWidth);
  const setPreviousContainerScrollLeftPosition = useUIStore(state => state.setPreviousScrollPosition);

  // Store the last day width to avoid expensive recalculations
  const dayWidth = useRef(chartTimeFrameView.dayWidthUnit + zoomWidth);

  // Update stored day width when chartTimeFrameView or zoomWidth changes
  useEffect(() => {
    dayWidth.current = chartTimeFrameView.dayWidthUnit + zoomWidth;
  }, [chartTimeFrameView, zoomWidth]);

  /**
   * Handle automatic scrolling when dragging near the edge of the container
   */
  const handleAutoScroll = (e: MouseEvent) => {
    if (interactionState.mode === 'idle' || !timelinePanelRef) return;

    const container = timelinePanelRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const edgeThreshold = 30;
    const scrollSpeed = 5;

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
          autoScrollRef.current = requestAnimationFrame(doAutoScroll);
        }
      };

      autoScrollRef.current = requestAnimationFrame(doAutoScroll);
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
      // Store the current mode before resetting it
      const currentMode = interactionState.mode;
      const currentBarId = interactionState.mode !== 'timelineDragging' ? interactionState.barId : '';
      const currentStartLeft = interactionState.mode === 'barDragging' ? interactionState.startLeft : 0;
      const currentStartWidth = interactionState.mode === 'barResizing' ? interactionState.startWidth : 0;
      const currentEdge = interactionState.mode === 'barResizing' ? interactionState.edge : undefined;
      const currentRowData = interactionState.mode !== 'timelineDragging' ? interactionState.rowData : undefined;

      // Reset to idle state immediately to prevent re-renders during updates
      setInteractionState({ mode: 'idle' });

      // Finalize the interaction
      switch (currentMode) {
        case 'timelineDragging': {
          console.log('Timeline dragging ended');
          console.log('timeline', timelinePanelRef);
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
          const newLeft = snapToGridValuePosition(barElement.style.left, dayWidth.current);
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
            const gridInterval = dayWidth.current;
            const newLeft = snapToGridValuePosition(barElement.style.left, gridInterval);
            const newWidth = Math.round(parseInt(barElement.style.width) / gridInterval) * gridInterval;
            const daysChanged = Math.round((newWidth - currentStartWidth) / gridInterval);

            // shallow copy the bar element for illusion magic trick
            barElement.style.left = `${newLeft}px`;
            barElement.style.width = `${newWidth}px`;

            if (daysChanged !== 0 || daysChanged !== 0) {
              updateRow(currentBarId, rowItem => {
                const newStartDate = new Date(rowItem.start);
                newStartDate.setDate(newStartDate.getDate() - daysChanged);

                return {
                  ...rowItem,
                  start: newStartDate.toISOString(),
                };
              });
            }
          } else {
            // Snap width to grid
            const gridInterval = dayWidth.current;
            const newWidth = Math.round(parseInt(barElement.style.width) / gridInterval) * gridInterval;
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

      // Stop auto-scrolling
      if (autoScrollRef?.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
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
  }, [interactionState, autoScrollRef, timelinePanelRef, setInteractionState, updateRow, setPreviousContainerScrollLeftPosition]);
};
