// src/stores/useInteractionStore.ts
import { create } from 'zustand';
import { Row } from '../types/row';

// Create a shared auto-scroll ref that persists between renders
const autoScrollRefValue = { current: null as number | null };

export type InteractionState =
  | { mode: 'idle' }
  | { mode: 'timelineDragging'; startX: number; scrollLeft: number }
  | { mode: 'barDragging'; barId: string; startX: number; startLeft: number; rowData: Row }
  | {
      mode: 'barResizing';
      barId: string;
      edge: 'left' | 'right';
      startX: number;
      startWidth: number;
      startLeft: number;
      rowData: Row;
    };

interface InteractionStateStore {
  interactionState: InteractionState;
  autoScrollRef: { current: number | null };
  leftBoundary: number;
  rightBoundary: number;
  isChartBorderReached: boolean;
  previousContainerScrollLeftPosition: number;

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
  setBoundaries: (left: number, right: number) => void;
  setIsChartBorderReached: (reached: boolean) => void;
  setPreviousContainerScrollLeftPosition: (position: number) => void;
}

export const useInteractionStore = create<InteractionStateStore>(set => ({
  interactionState: { mode: 'idle' },
  autoScrollRef: autoScrollRefValue,
  leftBoundary: 0,
  rightBoundary: 0,
  isChartBorderReached: false,
  previousContainerScrollLeftPosition: 0,

  setInteractionState: state => set({ interactionState: state }),
  setBoundaries: (left, right) => set({ leftBoundary: left, rightBoundary: right }),
  setIsChartBorderReached: reached => set({ isChartBorderReached: reached }),
  setPreviousContainerScrollLeftPosition: position => set({ previousContainerScrollLeftPosition: position }),

  startBarDrag: ({ barId, startX, startLeft, rowData }) =>
    set({
      interactionState: {
        mode: 'barDragging',
        barId,
        startX,
        startLeft,
        rowData,
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
      },
    }),

  startTimelineDrag: ({ startX, scrollLeft }) =>
    set({
      interactionState: {
        mode: 'timelineDragging',
        startX,
        scrollLeft,
      },
    }),
}));
