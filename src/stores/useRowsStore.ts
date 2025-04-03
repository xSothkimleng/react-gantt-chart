import { create } from 'zustand';
import { Row } from '../types/row';
import { updateNestedRowById } from '../utils/rowUtils';

type RowsState = {
  // State
  rows: Row[];
  collapsedItems: Set<string>;

  // Actions
  setRows: (rows: Row[]) => void;
  updateRow: (rowId: string | number, updateFn: (row: Row) => Row) => void;
  toggleCollapse: (itemId: string) => void;

  // Selectors
  getRowById: (rowId: string | number) => Row | undefined;
  getVisibleRows: () => Row[]; // Returns only non-collapsed rows
};

export const useRowsStore = create<RowsState>((set, get) => ({
  // State
  rows: [],
  collapsedItems: new Set<string>(),

  // Actions
  setRows: rows => set({ rows }),
  updateRow: (rowId, updateFn) =>
    set(state => ({
      rows: updateNestedRowById(state.rows, rowId, updateFn),
    })),
  toggleCollapse: itemId => {
    set(state => {
      const newCollapsedItems = new Set(state.collapsedItems);
      if (newCollapsedItems.has(itemId)) {
        newCollapsedItems.delete(itemId);
      } else {
        newCollapsedItems.add(itemId);
      }
      return { collapsedItems: newCollapsedItems };
    });
  },

  // Selectors
  getRowById: rowId => {
    const rows = get().rows;
    const findRowById = (rows: Row[], id: string | number): Row | undefined => {
      for (const row of rows) {
        if (row.id === id) {
          return row;
        }
        if (row.children) {
          const foundRow = findRowById(row.children, id);
          if (foundRow) {
            return foundRow;
          }
        }
      }
      return undefined;
    };
    return findRowById(rows, rowId);
  },

  getVisibleRows: () => {
    // Implementation for getting visible rows based on collapse state
    // This is a placeholder - you'll need to implement the actual logic
    return get().rows;
  },
}));
