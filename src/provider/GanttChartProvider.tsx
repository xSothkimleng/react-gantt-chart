import React, { useEffect, useMemo, useCallback } from 'react';
import { ReactNode, useRef, useState } from 'react';
import { GanttChartContext } from '../context/GanttChartContext';
import { GanttChartContextType, InteractionState } from '../types/ganttChartContextType';
import { DateRangeType } from '../types/dateRangeType';
import { TimeFrameSettingType } from '../types/timeFrameSettingType';
import { timeFrameSetting } from '../constants/timeFrameSetting';
import { Column } from '../types/column';
import { Row } from '../types/row';
import { snapToGridValuePosition } from '../utils/ganttBarUtils';
import { normalizeId } from '../utils/normalizeId';
import { registerZoomFunctions } from '../utils/zoomFunctions';

interface GanttChartProviderProps {
  children: ReactNode;
  row: Row[];
  column?: Column;
  defaultView?: TimeFrameSettingType;
  ButtonContainer?: React.FC;
  getSelectedRow?: (row: Row) => void;
}

// Helper function to update nested rows
const updateNestedRowById = (rows: Row[], rowId: string | number, updateFn: (rowItem: Row) => Row): Row[] => {
  const normalizedRowId = normalizeId(rowId);

  return rows.map(item => {
    // Convert current Row's ID to string for comparison
    if (normalizeId(item.id) === normalizedRowId) {
      return updateFn(item);
    }

    // If this row has children, recursively search them
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: updateNestedRowById(item.children, normalizedRowId, updateFn),
      };
    }

    // Otherwise return the row unchanged
    return item;
  });
};

export const GanttChartProvider: React.FC<GanttChartProviderProps> = ({
  row,
  column,
  children,
  getSelectedRow,
  defaultView = timeFrameSetting.quarterYear,
  ButtonContainer,
}) => {
  const leftBoundary = useRef<number>(0);
  const rightBoundary = useRef<number>(0);
  const isChartBorderReached = useRef<boolean>(false);
  const isReachedRightSideBorder = useRef<boolean>(false);
  const previousContainerScrollLeftPosition = useRef<number>(0);
  const timelinePanelRef = useRef<HTMLDivElement | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allRow, setAllRow] = useState<Row[]>(row);
  const [columnSetting, setColumnSetting] = useState<Column | undefined>(column);
  const [chartDateRange, setChartDateRange] = useState<DateRangeType>([]);
  const [activeDataIndex, setActiveDataIndex] = useState<number | null>(null);
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [chartTimeFrameView, setChartTimeFrameView] = useState<TimeFrameSettingType>(defaultView);

  // temporary variable
  const [zoomWidth, setZoomWidth] = useState<number>(0);

  // New interaction state
  const [interactionState, setInteractionState] = useState<InteractionState>({ mode: 'idle' });
  const autoScrollRef = useRef<number | null>(null);

  const zoomIn = useCallback(() => {
    if (timelinePanelRef.current) {
      // Get the container
      const container = timelinePanelRef.current;

      // find the position of the the current container's scrollLeft
      const scrollableWidth = Math.max(container.scrollWidth - container.clientWidth, 1);
      const visualRatio = container.scrollLeft / scrollableWidth;

      // Update zoom width with limit check
      const newZoomWidth = zoomWidth + 10;
      if (newZoomWidth < 0) return;
      setZoomWidth(newZoomWidth);

      // Use requestAnimationFrame to ensure DOM updates before we scroll
      requestAnimationFrame(() => {
        // Calculate new scroll position after zoom
        const newScrollableWidth = Math.max(container.scrollWidth - container.clientWidth, 1);
        const newScrollLeft = visualRatio * newScrollableWidth;

        // Apply the new scroll position
        container.scrollLeft = newScrollLeft;
        previousContainerScrollLeftPosition.current = newScrollLeft;
      });
    } else {
      // Just update zoom if no panel ref
      const newZoomWidth = zoomWidth + 10;
      if (newZoomWidth < 0) return;
      setZoomWidth(newZoomWidth);
    }
  }, [zoomWidth]);

  const zoomOut = useCallback(() => {
    if (timelinePanelRef.current) {
      // Get the container
      const container = timelinePanelRef.current;

      // find the position of the the current container's scrollLeft
      const scrollableWidth = Math.max(container.scrollWidth - container.clientWidth, 1);
      const visualRatio = container.scrollLeft / scrollableWidth;

      // Update zoom width with limit check

      const newZoomWidth = zoomWidth - 10;
      // Prevent zooming out too far - set a minimum limit
      if (newZoomWidth < 0) return;
      setZoomWidth(newZoomWidth);

      // Use requestAnimationFrame to ensure DOM updates before we scroll
      requestAnimationFrame(() => {
        // Calculate new scroll position after zoom
        const newScrollableWidth = Math.max(container.scrollWidth - container.clientWidth, 1);
        const newScrollLeft = visualRatio * newScrollableWidth;

        // Apply the new scroll position
        container.scrollLeft = newScrollLeft;
        previousContainerScrollLeftPosition.current = newScrollLeft;
      });
    } else {
      // Just update zoom if no panel ref
      const newZoomWidth = zoomWidth - 10;
      const minZoomWidth = -50; // Adjust this value as needed
      if (newZoomWidth < minZoomWidth) return;
      setZoomWidth(newZoomWidth);
    }
  }, [zoomWidth]);

  useEffect(() => {
    registerZoomFunctions(zoomIn, zoomOut);
  }, [zoomIn, zoomOut]);

  // Update time frame view when defaultView changes
  useEffect(() => {
    if (defaultView && defaultView.name !== chartTimeFrameView.name) {
      setChartTimeFrameView(defaultView);
    }
  }, [defaultView, chartTimeFrameView.name]);

  useEffect(() => {
    console.log('defaultView changed:', defaultView);
  }, [defaultView]);

  // Update Data when dataSource changes
  useEffect(() => {
    setAllRow(row);
  }, [row]);

  // Handle auto-scrolling during interactions
  const handleAutoScroll = useCallback(
    (e: MouseEvent) => {
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
    },
    [interactionState],
  );

  //  mouse event handling
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
            previousContainerScrollLeftPosition.current = timelinePanelRef.current.scrollLeft;
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
            setAllRow(prevRows => {
              return updateNestedRowById(prevRows, interactionState.barId, rowItem => {
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
            });
          }

          previousContainerScrollLeftPosition.current = timelinePanelRef.current?.scrollLeft || 0;
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
              setAllRow(prevRows => {
                return updateNestedRowById(prevRows, interactionState.barId, rowItem => {
                  const newStartDate = new Date(rowItem.start);
                  newStartDate.setDate(newStartDate.getDate() + daysMoved);

                  return {
                    ...rowItem,
                    start: newStartDate.toISOString(),
                  };
                });
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
              setAllRow(prevRows => {
                return updateNestedRowById(prevRows, interactionState.barId, rowItem => {
                  const newEndDate = new Date(rowItem.end);
                  newEndDate.setDate(newEndDate.getDate() + daysChanged);

                  return {
                    ...rowItem,
                    end: newEndDate.toISOString(),
                  };
                });
              });
            }
          }

          previousContainerScrollLeftPosition.current = timelinePanelRef.current?.scrollLeft || 0;
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
  }, [interactionState, chartTimeFrameView, handleAutoScroll]);

  const toggleCollapse = (itemId: string) => {
    setCollapsedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const contextValue = useMemo<GanttChartContextType>(
    () => ({
      // State values
      collapsedItems,
      isLoading,
      chartDateRange,
      chartTimeFrameView,
      allRow,
      columnSetting,
      activeDataIndex,
      zoomWidth,

      // New interaction state
      interactionState,
      setInteractionState,
      autoScrollRef,

      // refs
      isChartBorderReached,
      isReachedRightSideBorder,
      previousContainerScrollLeftPosition,
      timelinePanelRef,
      leftBoundary,
      rightBoundary,

      // Functions
      toggleCollapse,
      setIsLoading,
      setChartDateRange,
      setChartTimeFrameView,
      setAllRow,
      setColumnSetting,
      setActiveDataIndex,
      getSelectedRow,
      ButtonContainer,
      zoomIn,
      zoomOut,
    }),
    [
      collapsedItems,
      isLoading,
      chartDateRange,
      chartTimeFrameView,
      allRow,
      columnSetting,
      activeDataIndex,
      interactionState,
      getSelectedRow,
      ButtonContainer,
      zoomIn,
      zoomOut,
      zoomWidth,
    ],
  );

  return <GanttChartContext.Provider value={contextValue}>{children}</GanttChartContext.Provider>;
};
