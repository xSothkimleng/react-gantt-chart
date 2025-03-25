// src/stores/useRowsStore.ts
import { create } from 'zustand';
import { Row } from '../types/row';
import { normalizeId } from '../utils/normalizeId';

interface RowsState {
  // Normalized data structure
  rowsById: Record<string, Row>;
  rootIds: string[];

  // Methods
  setRows: (rows: Row[]) => void;
  updateRow: (id: string | number, updates: Partial<Row>) => void;
  moveRow: (id: string | number, daysMoved: number) => void;
  resizeRow: (id: string | number, edge: 'left' | 'right', daysChanged: number) => void;
}

// Helper function to normalize rows into our data structure
const normalizeRows = (
  rows: Row[],
): {
  rowsById: Record<string, Row>;
  rootIds: string[];
} => {
  const rowsById: Record<string, Row> = {};
  const rootIds: string[] = [];

  // Recursive function to process rows and their children
  const processRow = (row: Row, isRoot = false) => {
    const id = normalizeId(row.id);

    // Copy the row without its children to normalize
    const { children, ...rowWithoutChildren } = row;
    rowsById[id] = rowWithoutChildren as Row;

    // If this is a root row, add its ID to rootIds
    if (isRoot) {
      rootIds.push(id);
    }

    // Process children if they exist
    if (children && children.length > 0) {
      // Store the children's IDs in the parent row
      rowsById[id].children = children.map(child => {
        const childId = normalizeId(child.id);
        processRow(child);
        return childId;
      });
    }
  };

  // Process all root rows
  rows.forEach(row => processRow(row, true));

  return { rowsById, rootIds };
};

// Helper to denormalize back to the original structure for API calls or exports
export const denormalizeRows = (rowsById: Record<string, Row>, rootIds: string[]): Row[] => {
  const buildRow = (id: string): Row => {
    const row = { ...rowsById[id] };

    if (row.children && Array.isArray(row.children)) {
      row.children = (row.children as unknown as string[]).map(childId => buildRow(childId));
    }

    return row;
  };

  return rootIds.map(id => buildRow(id));
};

export const useRowsStore = create<RowsState>(set => ({
  rowsById: {},
  rootIds: [],

  setRows: rows => {
    const { rowsById, rootIds } = normalizeRows(rows);
    set({ rowsById, rootIds });
  },

  updateRow: (id, updates) =>
    set(state => {
      const stringId = normalizeId(id);

      // Only update if the row exists
      if (!state.rowsById[stringId]) return state;

      return {
        rowsById: {
          ...state.rowsById,
          [stringId]: {
            ...state.rowsById[stringId],
            ...updates,
          },
        },
      };
    }),

  moveRow: (id, daysMoved) =>
    set(state => {
      const stringId = normalizeId(id);
      const row = state.rowsById[stringId];

      // Only update if the row exists
      if (!row) return state;

      const newStartDate = new Date(row.start);
      newStartDate.setDate(newStartDate.getDate() + daysMoved);

      const newEndDate = new Date(row.end);
      newEndDate.setDate(newEndDate.getDate() + daysMoved);

      return {
        rowsById: {
          ...state.rowsById,
          [stringId]: {
            ...row,
            start: newStartDate.toISOString(),
            end: newEndDate.toISOString(),
          },
        },
      };
    }),

  resizeRow: (id, edge, daysChanged) =>
    set(state => {
      const stringId = normalizeId(id);
      const row = state.rowsById[stringId];

      // Only update if the row exists
      if (!row) return state;

      if (edge === 'left') {
        const newStartDate = new Date(row.start);
        newStartDate.setDate(newStartDate.getDate() + daysChanged);

        return {
          rowsById: {
            ...state.rowsById,
            [stringId]: {
              ...row,
              start: newStartDate.toISOString(),
            },
          },
        };
      } else {
        const newEndDate = new Date(row.end);
        newEndDate.setDate(newEndDate.getDate() + daysChanged);

        return {
          rowsById: {
            ...state.rowsById,
            [stringId]: {
              ...row,
              end: newEndDate.toISOString(),
            },
          },
        };
      }
    }),
}));
