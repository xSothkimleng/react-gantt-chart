// src/stores/useRowsStore.ts
import { create } from 'zustand';
import { Row } from '../types/row';
import { updateNestedRowById } from '../utils/rowUtils';

interface RowsState {
  // Data
  allRows: Row[];
  externalGetSelectedRow?: (row: Row) => void;
  ButtonContainer?: React.FC;

  // Actions
  setAllRows: (rows: Row[]) => void;
  updateRow: (rowId: string | number, updateFn: (row: Row) => Row) => void;
  selectRow: (row: Row) => void;
  setExternalGetSelectedRow: (fn: ((row: Row) => void) | undefined) => void;
  setButtonContainer: (component: React.FC | undefined) => void;
}

export const useRowsStore = create<RowsState>((set, get) => ({
  allRows: [],
  externalGetSelectedRow: undefined,
  ButtonContainer: undefined,

  setAllRows: rows => set({ allRows: rows }),

  updateRow: (rowId, updateFn) =>
    set(state => ({
      allRows: updateNestedRowById(state.allRows, rowId, updateFn),
    })),

  selectRow: row => {
    const { externalGetSelectedRow } = get();
    if (externalGetSelectedRow) {
      externalGetSelectedRow(row);
    }
  },

  setExternalGetSelectedRow: fn => set({ externalGetSelectedRow: fn }),
  setButtonContainer: component => set({ ButtonContainer: component }),
}));
