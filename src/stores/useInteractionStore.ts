// src/stores/useInteractionStore.ts
import { create } from 'zustand';
import { Row } from '../types/row';

type IdleState = { mode: 'idle' };
type TimelineDraggingState = { mode: 'timelineDragging'; startX: number; scrollLeft: number };
type BarDraggingState = { mode: 'barDragging'; barId: string; startX: number; startLeft: number; rowData: Row };
type BarResizingState = {
  mode: 'barResizing';
  barId: string;
  edge: 'left' | 'right';
  startX: number;
  startWidth: number;
  startLeft: number;
  rowData: Row;
};

export type InteractionState = IdleState | TimelineDraggingState | BarDraggingState | BarResizingState;

interface InteractionStore {
  state: InteractionState;
  setInteractionState: (state: InteractionState) => void;
}

export const useInteractionStore = create<InteractionStore>(set => ({
  state: { mode: 'idle' },
  setInteractionState: state => set({ state }),
}));
