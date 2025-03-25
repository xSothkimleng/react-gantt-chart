// src/hooks/useGanttInteractions.tsx
import { useEffect, useRef } from 'react';
import { useInteractionStore, useRowsStore, useConfigStore } from '../stores';
import { snapToGridValuePosition } from '../utils/ganttBarUtils';

export function useGanttInteractions(timelinePanelRef: React.RefObject<HTMLDivElement>) {
  const { state: interactionState, setInteractionState } = useInteractionStore();
  const { moveRow, resizeRow } = useRowsStore();
  const { chartTimeFrameView } = useConfigStore();

  // Reference for auto-scrolling animation
  const autoScrollRef = useRef<number | null>(null);

  // Handle auto-scrolling during interactions
  const handleAutoScroll = (e: MouseEvent) => {
    if (interactionState.mode === 'idle' || !timelinePanelRef.current) return;

    const container = timelinePanelRef.current;
    const rect = container.getBoundingClientRect();
    const edgeThreshold = 30;
    const scrollSpeed = 15;

    const isNearRightEdge = e.clientX > rect.right - edgeThreshold;
    const isNearLeftEdge = e.clientX < rect.left + edgeThreshold;

    // Cancel existing auto-scroll if we're not near an edge
    if (!isNearRightEdge && !isNearLeftEdge && autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
      return;
    }

    // Start auto-scrolling if not already started
    if ((isNearRightEdge || isNearLeftEdge) && !autoScrollRef.current) {
      autoScrollRef.current = requestAnimationFrame(function autoScroll() {
        if (!timelinePanelRef.current) return;

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
        autoScrollRef.current = requestAnimationFrame(autoScroll);
      });
    }
  };

  // Handle mouse events globally
  useEffect(() => {
    // Skip event handling if in idle mode
    if (interactionState.mode === 'idle') return;

    // Define handlers based on current interaction mode
    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      // Handle auto-scrolling for all interaction modes
      handleAutoScroll(e);

      switch (interactionState.mode) {
        case 'timelineDragging': {
          if (!timelinePanelRef.current) return;
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

    const handleMouseUp = () => {
      // Finalize the interaction
      switch (interactionState.mode) {
        case 'timelineDragging': {
          if (timelinePanelRef.current) {
            timelinePanelRef.current.style.cursor = 'grab';
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
            moveRow(interactionState.barId, daysMoved);
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
              resizeRow(interactionState.barId, 'left', daysMoved);
            }
          } else {
            // Snap width to grid
            const gridInterval = chartTimeFrameView.dayWidthUnit;
            const newWidth = Math.round(parseInt(barElement.style.width) / gridInterval) * gridInterval;
            barElement.style.width = `${newWidth}px`;

            // Update end date
            const daysChanged = Math.round((newWidth - interactionState.startWidth) / chartTimeFrameView.dayWidthUnit);

            if (daysChanged !== 0) {
              resizeRow(interactionState.barId, 'right', daysChanged);
            }
          }
          break;
        }
      }

      // Stop auto-scrolling
      if (autoScrollRef.current) {
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
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current);
        autoScrollRef.current = null;
      }
    };
  }, [interactionState, chartTimeFrameView.dayWidthUnit, setInteractionState, moveRow, resizeRow]);

  return { autoScrollRef };
}
