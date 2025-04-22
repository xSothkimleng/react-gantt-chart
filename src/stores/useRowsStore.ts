import { create } from 'zustand';
import { Row } from '../types/row';

type RowsState = {
  // Normalized data structure
  rowsById: Record<string, Row>;
  rootIds: string[];
  parentChildMap: Record<string, string[]>;
  updateTimestamp: number;

  // Original state
  rows: Row[];
  collapsedItems: Set<string>;

  // Actions
  getAllRows: () => Row[];
  memoizedRows: () => Row[];
  setRows: (rows: Row[]) => void;
  getRowsCount: () => number;
  getDateBoundaries: () => { earliest: Date; latest: Date };
  findEarliestRow: () => Row | undefined;
  updateRow: (rowId: string | number, updateFn: (row: Row) => Row) => void;
  toggleCollapse: (itemId: string) => void;

  // Selectors
  getRowById: (rowId: string | number) => Row | undefined;
  getVisibleRows: () => Row[];
};

export const useRowsStore = create<RowsState>((set, get) => ({
  // Normalized data structure
  rowsById: {},
  rootIds: [],
  parentChildMap: {},
  updateTimestamp: Date.now(),

  // Original state
  rows: [],
  collapsedItems: new Set<string>(),

  // Actions
  setRows: rows => {
    const rowsById: Record<string, Row> = {};
    const rootIds: string[] = [];
    const parentChildMap: Record<string, string[]> = {};

    // Helper function to process rows recursively
    const processRow = (row: Row, parentId?: string) => {
      const id = String(row.id);

      // Clone row without the children property to avoid circular references
      const { children, ...rowWithoutChildren } = row;
      rowsById[id] = rowWithoutChildren as Row;

      if (parentId) {
        // Add to parent's children list
        if (!parentChildMap[parentId]) {
          parentChildMap[parentId] = [];
        }
        parentChildMap[parentId].push(id);
      } else {
        // This is a root row
        rootIds.push(id);
      }

      // Process children recursively
      if (children && children.length > 0) {
        children.forEach(child => processRow(child, id));
      }
    };

    // Process all rows
    rows.forEach(row => processRow(row));

    set({
      rowsById,
      rootIds,
      parentChildMap,
      rows, // Make sure to set the original rows array too
      updateTimestamp: Date.now(),
    });
  },

  getAllRows: () => {
    const { rowsById, rootIds, parentChildMap } = get();

    // Reconstruct the nested structure for compatibility
    const buildRowHierarchy = (ids: string[]): Row[] => {
      return ids.map(id => {
        const row = { ...rowsById[id] };
        const childIds = parentChildMap[id];

        if (childIds && childIds.length > 0) {
          row.children = buildRowHierarchy(childIds);
        }

        return row;
      });
    };

    return buildRowHierarchy(rootIds);
  },

  // Memoized version of getAllRows to prevent infinite loops
  memoizedRows: (() => {
    let cachedRows: Row[] | null = null;
    let lastUpdateTimestamp = -1;

    return () => {
      const currentTimestamp = get().updateTimestamp;
      if (cachedRows && lastUpdateTimestamp === currentTimestamp) {
        return cachedRows;
      }

      const result = get().getAllRows();

      // Cache the result
      cachedRows = result;
      lastUpdateTimestamp = currentTimestamp;
      return result;
    };
  })(),

  updateRow: (rowId, updateFn) => {
    const id = String(rowId);
    const row = get().rowsById[id];

    if (row) {
      set(state => ({
        rowsById: {
          ...state.rowsById,
          [id]: updateFn(row),
        },
        updateTimestamp: Date.now(),
      }));
    }
  },

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

  getRowById: rowId => {
    return get().rowsById[String(rowId)];
  },

  getVisibleRows: () => {
    return get().memoizedRows();
  },

  getDateBoundaries: () => {
    const { rowsById } = get();
    if (Object.keys(rowsById).length === 0) {
      return { earliest: new Date(), latest: new Date() };
    }

    const allDates = Object.values(rowsById).flatMap(row => [new Date(row.start), new Date(row.end)]);
    return {
      earliest: new Date(Math.min(...allDates.map(date => date.getTime()))),
      latest: new Date(Math.max(...allDates.map(date => date.getTime()))),
    };
  },

  getRowsCount: () => {
    return Object.keys(get().rowsById).length;
  },

  findEarliestRow: () => {
    const { rowsById } = get();
    if (Object.keys(rowsById).length === 0) return undefined;

    let earliestDate = new Date();
    let earliestRowId = '';

    Object.entries(rowsById).forEach(([id, row]) => {
      const startDate = new Date(row.start);
      if (!earliestRowId || startDate < earliestDate) {
        earliestDate = startDate;
        earliestRowId = id;
      }
    });

    return earliestRowId ? rowsById[earliestRowId] : undefined;
  },
}));
