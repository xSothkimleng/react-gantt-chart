import { create } from 'zustand';
import { Row } from '../types/row';

// Create a shared auto-scroll ref that persists between renders
const autoScrollRefValue = { current: null as number | null };

export type InteractionState =
  | { mode: 'idle' }
  | { mode: 'timelineDragging'; startX: number; scrollLeft: number }
  | {
      mode: 'barDragging';
      barId: string;
      startX: number;
      startLeft: number;
      rowData: Row;
      // Add tooltip position and visibility
      tooltipPosition: { x: number; y: number };
      tooltipVisible: boolean;
    }
  | {
      mode: 'barResizing';
      barId: string;
      edge: 'left' | 'right';
      startX: number;
      startWidth: number;
      startLeft: number;
      rowData: Row;
      // Add tooltip position and visibility for resizing too
      tooltipPosition: { x: number; y: number };
      tooltipVisible: boolean;
    };

interface InteractionStore {
  // State
  interactionState: InteractionState;
  autoScrollRef: { current: number | null };
  leftBoundary: number;
  rightBoundary: number;
  isChartBorderReached: boolean;

  // Actions
  setInteractionState: (state: InteractionState) => void;
  startBarDrag: (params: { barId: string; startX: number; startLeft: number; rowData: Row }) => void;
  startBarResize: (params: {
    barId: string;
    edge: 'left' | 'right';
    startX: number;
    startWidth: number;
    startLeft: number;
    rowData: Row;
  }) => void;
  startTimelineDrag: (params: { startX: number; scrollLeft: number }) => void;
  updateTooltipPosition: (x: number, y: number) => void;
  setBoundaries: (left: number, right: number) => void;
  setIsChartBorderReached: (reached: boolean) => void;
}

export const useInteractionStore = create<InteractionStore>((set, get) => ({
  // State
  interactionState: { mode: 'idle' },
  autoScrollRef: autoScrollRefValue,
  leftBoundary: 0,
  rightBoundary: 0,
  isChartBorderReached: false,

  // Actions
  setInteractionState: state => set({ interactionState: state }),

  startBarDrag: ({ barId, startX, startLeft, rowData }) =>
    set({
      interactionState: {
        mode: 'barDragging',
        barId,
        startX,
        startLeft,
        rowData,
        tooltipPosition: { x: startX, y: 0 }, // Initial position, Y will be updated on mousemove
        tooltipVisible: true,
      },
    }),

  startBarResize: ({ barId, edge, startX, startWidth, startLeft, rowData }) =>
    set({
      interactionState: {
        mode: 'barResizing',
        barId,
        edge,
        startX,
        startWidth,
        startLeft,
        rowData,
        tooltipPosition: { x: startX, y: 0 }, // Initial position, Y will be updated on mousemove
        tooltipVisible: true,
      },
    }),

  startTimelineDrag: ({ startX, scrollLeft }) =>
    set({
      interactionState: { mode: 'timelineDragging', startX, scrollLeft },
    }),

  updateTooltipPosition: (x, y) => {
    const state = get().interactionState;

    if (state.mode === 'barDragging') {
      set({
        interactionState: {
          ...state,
          tooltipPosition: { x, y },
        },
      });
    } else if (state.mode === 'barResizing') {
      set({
        interactionState: {
          ...state,
          tooltipPosition: { x, y },
        },
      });
    }
  },

  setBoundaries: (left, right) => set({ leftBoundary: left, rightBoundary: right }),
  setIsChartBorderReached: reached => set({ isChartBorderReached: reached }),
}));
